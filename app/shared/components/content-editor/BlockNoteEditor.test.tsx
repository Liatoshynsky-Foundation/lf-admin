import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { BlockNoteEditor } from './BlockNoteEditor';

type SlashMenuItem = {
  title: string;
  onItemClick?: () => Promise<void>;
};

type ToolbarItem = {
  key: string;
  type?: string;
};

const mockInsertBlocks = jest.fn();
const mockUpdateBlock = jest.fn();
const mockGetTextCursorPosition = jest.fn(() => ({ block: { id: 'mock-block-id' } }));

const mockEditor = {
  document: [],
  getTextCursorPosition: mockGetTextCursorPosition,
  insertBlocks: mockInsertBlocks,
  updateBlock: mockUpdateBlock
};

let capturedCreateOptions: { uploadFile: (file: File) => Promise<string> } | null = null;
let capturedSelectedBlocks: { id: string; type: string }[] = [];

jest.mock('@blocknote/core', () => ({
  BlockNoteSchema: {
    create: jest.fn(() => ({}))
  },
  defaultBlockSpecs: {},
  defaultInlineContentSpecs: {},
  defaultStyleSpecs: {}
}));

jest.mock('@blocknote/react', () => ({
  useCreateBlockNote: jest.fn((options: { uploadFile: (file: File) => Promise<string> }) => {
    capturedCreateOptions = options;
    return mockEditor;
  }),
  getDefaultReactSlashMenuItems: jest.fn(() => [
    { title: 'Heading', group: 'Text' },
    { title: 'Image', group: 'Media' },
    { title: 'Image (Upload)', group: 'Media' }
  ]),
  SuggestionMenuController: ({ getItems }: { getItems: (query: string) => Promise<SlashMenuItem[]> }) => {
    return (
      <div data-testid="suggestion-menu-controller">
        <button
          data-testid="trigger-custom-slash-item"
          onClick={async () => {
            const items = await getItems('pic');
            const pictureItem = items.find((i: SlashMenuItem) => i.title === 'Picture');
            if (pictureItem && pictureItem.onItemClick) {
              await pictureItem.onItemClick();
            }
          }}
        >
          Trigger Slash Menu
        </button>
      </div>
    );
  },
  useSelectedBlocks: () => capturedSelectedBlocks,
  useComponentsContext: () => ({
    FormattingToolbar: {
      Button: ({ label, onClick }: { label: string; onClick: () => void }) => (
        <button data-testid="custom-replace-button" onClick={onClick}>
          {label}
        </button>
      )
    }
  }),
  getFormattingToolbarItems: (): ToolbarItem[] => [{ key: 'boldButton' }, { key: 'replaceFileButton' }],
  FormattingToolbar: ({ children }: { children: any[] }) => (
    <div data-testid="formatting-toolbar">
      {Array.isArray(children)
        ? children.map((child, idx) =>
          React.isValidElement(child) ? (
            React.cloneElement(child, { key: child.key || idx } as any)
          ) : (
            <span key={child.key || idx}>{child.key}</span>
          )
        )
        : children}
    </div>
  ),
  FormattingToolbarController: ({ formattingToolbar }: { formattingToolbar: () => React.ReactNode }) => (
    <div data-testid="formatting-toolbar-controller">{formattingToolbar()}</div>
  )
}));

jest.mock('@blocknote/mantine', () => ({
  BlockNoteView: ({ children, editable }: { children: React.ReactNode; editable: boolean }) => (
    <div data-testid="blocknote-editor" data-editable={editable}>
      {children}
    </div>
  )
}));

jest.mock('@blocknote/xl-multi-column', () => ({
  multiColumnDropCursor: {},
  withMultiColumn: jest.fn((schema: unknown) => schema)
}));

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  MediaModal: ({
    open,
    onClose,
    onApply
  }: {
    open: boolean;
    onClose: () => void;
    onApply: (result: { selected: { kind: string; src?: string }; uploadResult: null }) => void;
  }) => {
    if (!open) return null;
    return (
      <div data-testid="media-modal">
        <button
          data-testid="modal-apply-success"
          onClick={() =>
            onApply({
              selected: { kind: 'library', src: 'https://example.com/mock-image.png' },
              uploadResult: null
            })
          }
        >
          Apply Success
        </button>
        <button data-testid="modal-close" onClick={onClose}>
          Cancel Close
        </button>
      </div>
    );
  }
}));

describe('BlockNoteEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedCreateOptions = null;
    capturedSelectedBlocks = [];
  });

  describe('1. Mounting', () => {
    it('should render the loading state initially, then render the BlockNoteView', async () => {
      render(<BlockNoteEditor editable={true} />);

      const editor = await screen.findByTestId('blocknote-editor');
      expect(editor).toBeInTheDocument();
      expect(editor).toHaveAttribute('data-editable', 'true');
      expect(screen.getByTestId('suggestion-menu-controller')).toBeInTheDocument();
      expect(screen.getByTestId('formatting-toolbar-controller')).toBeInTheDocument();
    });
  });

  describe('2. Silent Upload (Drag & Drop)', () => {
    it('should successfully trigger the fileUpload.handler and return the URL', async () => {
      const mockHandler = jest.fn().mockResolvedValue('https://example.com/silent-upload.png');

      render(<BlockNoteEditor fileUpload={{ handler: mockHandler, maxFileSize: 50000 }} />);

      await waitFor(() => expect(capturedCreateOptions).not.toBeNull());

      const fakeFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
      Object.defineProperty(fakeFile, 'size', { value: 1024 });

      const resultUrl = await capturedCreateOptions!.uploadFile(fakeFile);

      expect(mockHandler).toHaveBeenCalledWith(fakeFile);
      expect(resultUrl).toBe('https://example.com/silent-upload.png');
    });

    it('should enforce the maxFileSize error logic', async () => {
      const mockHandler = jest.fn();

      render(<BlockNoteEditor fileUpload={{ handler: mockHandler, maxFileSize: 100 }} />);

      await waitFor(() => expect(capturedCreateOptions).not.toBeNull());

      const fakeFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
      Object.defineProperty(fakeFile, 'size', { value: 5000 });

      await expect(capturedCreateOptions!.uploadFile(fakeFile)).rejects.toThrow(
        'File size exceeds maximum allowed size'
      );
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('3. The Promise Flow (Success)', () => {
    it('should open the modal, wait for application, and insert the block with exact URL', async () => {
      render(<BlockNoteEditor />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('trigger-custom-slash-item'));
      });

      const modal = await screen.findByTestId('media-modal');
      expect(modal).toBeInTheDocument();
      expect(mockInsertBlocks).not.toHaveBeenCalled();

      await act(async () => {
        fireEvent.click(screen.getByTestId('modal-apply-success'));
      });

      expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();

      expect(mockGetTextCursorPosition).toHaveBeenCalled();
      expect(mockInsertBlocks).toHaveBeenCalledTimes(1);
      expect(mockInsertBlocks).toHaveBeenCalledWith(
        [{ type: 'image', props: { url: 'https://example.com/mock-image.png' } }],
        { id: 'mock-block-id' },
        'after'
      );
    });
  });

  describe('4. The Promise Flow (Cancellation)', () => {
    it('should open the modal, fire onClose, and NEVER call editor.insertBlocks', async () => {
      render(<BlockNoteEditor />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('trigger-custom-slash-item'));
      });

      expect(await screen.findByTestId('media-modal')).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByTestId('modal-close'));
      });

      expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();

      expect(mockInsertBlocks).not.toHaveBeenCalled();
    });
  });

  describe('5. Formatting Toolbar Replace Flow', () => {
    it('should not render the CustomReplaceButton if no blocks are selected', () => {
      capturedSelectedBlocks = [];
      render(<BlockNoteEditor />);

      expect(screen.queryByTestId('custom-replace-button')).not.toBeInTheDocument();
    });

    it('should not render the CustomReplaceButton if the selected block is not an image', () => {
      capturedSelectedBlocks = [{ id: 'text-1', type: 'paragraph' }];
      render(<BlockNoteEditor />);

      expect(screen.queryByTestId('custom-replace-button')).not.toBeInTheDocument();
    });

    it('should render the CustomReplaceButton when exactly one image block is selected', () => {
      capturedSelectedBlocks = [{ id: 'img-1', type: 'image' }];
      render(<BlockNoteEditor />);

      expect(screen.getByTestId('custom-replace-button')).toBeInTheDocument();
    });

    it('should open the modal and update the block when the CustomReplaceButton is clicked and applied', async () => {
      capturedSelectedBlocks = [{ id: 'img-1', type: 'image' }];
      render(<BlockNoteEditor />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('custom-replace-button'));
      });

      const modal = await screen.findByTestId('media-modal');
      expect(modal).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByTestId('modal-apply-success'));
      });

      expect(mockUpdateBlock).toHaveBeenCalledTimes(1);
      expect(mockUpdateBlock).toHaveBeenCalledWith('img-1', {
        type: 'image',
        props: { url: 'https://example.com/mock-image.png' }
      });
    });
  });
});
