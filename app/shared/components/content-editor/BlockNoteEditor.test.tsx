import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import toast from 'react-hot-toast';
jest.mock('react-hot-toast', () => ({
  error: jest.fn()
}));

import { BlockNoteEditor } from './BlockNoteEditor';
import { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';

type SlashMenuItem = {
  title: string;
  onItemClick?: () => Promise<void>;
};

type ToolbarItem = {
  key: string;
  type?: string;
};

type MockBlock = {
  id?: string;
  type: string;
  props?: Record<string, unknown>;
};

type CreateOptions = {
  uploadFile: (file: File) => Promise<string>;
  onChange?: () => void;
  pasteHandler: ({ event, editor, defaultPasteHandler }: any) => void;
};

const mockUpdateBlock = jest.fn();

let mockDocumentState: MockBlock[] = [];
let capturedCreateOptions: CreateOptions | null = null;
let captureSlashMenuOpenMediaModal: (() => Promise<MediaModalResult | null>) | null = null;
const mockCursorBlock = jest.fn();
const mockEditor = {
  document: mockDocumentState,
  updateBlock: mockUpdateBlock,
  insertBlocks: jest.fn(),
  insertInlineContent: jest.fn(),
  tryParseHTMLToBlocks: jest.fn(),
  getTextCursorPosition: () => ({
    block: mockCursorBlock
  })
};

jest.mock('@blocknote/core', () => ({
  BlockNoteSchema: {
    create: jest.fn(() => ({}))
  },
  defaultBlockSpecs: {},
  defaultInlineContentSpecs: {},
  defaultStyleSpecs: {}
}));

jest.mock('~/lib/utils/getCustomSlashMenuItems', () => ({
  getCustomSlashMenuItems: jest.fn(
    (_editor: unknown, _query: string, openModal: () => Promise<MediaModalResult | null>) => {
      captureSlashMenuOpenMediaModal = openModal;
      return [
        {
          title: 'Picture',
          onItemClick: async () => {
            await openModal();
          }
        }
      ];
    }
  )
}));

jest.mock('@blocknote/react', () => ({
  useCreateBlockNote: jest.fn((options: CreateOptions) => {
    capturedCreateOptions = options;
    return mockEditor;
  }),
  SuggestionMenuController: ({ getItems }: { getItems: (query: string) => Promise<SlashMenuItem[]> }) => (
    <div data-testid="suggestion-menu-controller">
      <button
        data-testid="trigger-slash-menu"
        onClick={async () => {
          const items = await getItems('');
          if (items[0]?.onItemClick) await items[0].onItemClick();
        }}
      >
        Open Slash Menu
      </button>
    </div>
  ),
  getFormattingToolbarItems: (): ToolbarItem[] => [{ key: 'boldButton' }, { key: 'replaceFileButton' }],
  FormattingToolbar: ({ children }: { children: (React.ReactElement | ToolbarItem)[] }) => (
    <div data-testid="formatting-toolbar">
      {Array.isArray(children)
        ? children.map((child, idx) => {
          // If it's our CustomReplaceButton React element
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { key: child.key || String(idx) } as React.Attributes);
          }
          const item = child as ToolbarItem;
          return <span key={item.key || String(idx)}>{item.key}</span>;
        })
        : null}
    </div>
  ),
  FormattingToolbarController: ({ formattingToolbar }: { formattingToolbar: () => React.ReactNode }) => (
    <div data-testid="formatting-toolbar-controller">{formattingToolbar()}</div>
  )
}));

jest.mock('@blocknote/mantine', () => ({
  BlockNoteView: ({
    children,
    editable,
    onChange
  }: {
    children: React.ReactNode;
    editable?: boolean;
    onChange?: () => void;
  }) => (
    <div data-testid="blocknote-editor" data-editable={editable}>
      <button data-testid="trigger-editor-change" onClick={onChange} />
      {children}
    </div>
  )
}));

jest.mock('./cropped-image-block/CroppedImageBlock', () => ({
  CroppedImageBlock: jest.fn(() => ({}))
}));

jest.mock('./custom-replace-button/CustomReplaceButton', () => ({
  CustomReplaceButton: ({ openMediaModal }: { openMediaModal: () => Promise<MediaModalResult | null> }) => (
    <button data-testid="custom-replace-button" onClick={openMediaModal}>
      Replace
    </button>
  )
}));

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  MediaModal: ({
    open,
    onClose,
    onApply
  }: {
    open: boolean;
    onClose: () => void;
    onApply: (result: MediaModalResult) => void;
  }) => {
    if (!open) return null;
    return (
      <div data-testid="media-modal">
        <button
          data-testid="modal-apply-success"
          onClick={() =>
            onApply({
              selected: {
                kind: 'gallery',
                src: 'https://example.com/mock-image.png',
                id: '1',
                fileName: 'mock',
                locale: 'en'
              },
              crop: null,
              uploadResult: undefined
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

const createMockParsedBlocks = (contentText: string) => (
  [
    {
      id: 'mock-block-id-1',
      type: 'paragraph',
      props: {
        textColor: 'default',
        backgroundColor: 'default',
        textAlignment: 'left'
      },
      content: [
        {
          type: 'text',
          text: contentText,
          styles: {}
        }
      ],
      children: []
    }
  ]
);

describe('BlockNoteEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedCreateOptions = null;
    captureSlashMenuOpenMediaModal = null;
    mockDocumentState = [];
    mockEditor.document = mockDocumentState;
  });

  describe('1. Mounting & Rendering', () => {
    it('should render the loading state initially, then render the BlockNoteView', async () => {
      render(<BlockNoteEditor />);

      const editor = await screen.findByTestId('blocknote-editor');
      expect(editor).toBeInTheDocument();
      expect(editor).toHaveAttribute('data-editable', 'true');
      expect(screen.getByTestId('suggestion-menu-controller')).toBeInTheDocument();
      expect(screen.getByTestId('formatting-toolbar-controller')).toBeInTheDocument();
    });

    it('should inject the CustomReplaceButton into the formatting toolbar', async () => {
      render(<BlockNoteEditor />);
      await screen.findByTestId('blocknote-editor');

      expect(screen.getByTestId('custom-replace-button')).toBeInTheDocument();
      expect(screen.queryByText('replaceFileButton')).not.toBeInTheDocument();
    });
  });

  describe('2. Silent File Uploads', () => {
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

  describe('3. Editor Change', () => {
    it('should call onChange prop with the current document state', async () => {
      const onChangeMock = jest.fn();
      mockDocumentState = [{ type: 'paragraph' }];
      mockEditor.document = mockDocumentState;

      render(<BlockNoteEditor onChange={onChangeMock} />);
      await screen.findByTestId('blocknote-editor');
      fireEvent.click(screen.getByTestId('trigger-editor-change'));

      expect(onChangeMock).toHaveBeenCalledTimes(1);
      expect(onChangeMock).toHaveBeenCalledWith(mockDocumentState);

      expect(mockUpdateBlock).not.toHaveBeenCalled();
    });
  });

  describe('4. The Media Modal Promise Flow', () => {
    it('should resolve the promise and close the modal when Apply is clicked', async () => {
      render(<BlockNoteEditor />);
      await screen.findByTestId('blocknote-editor');

      let promiseResult: MediaModalResult | null | undefined;
      await act(async () => {
        fireEvent.click(screen.getByTestId('trigger-slash-menu'));
      });

      captureSlashMenuOpenMediaModal!().then((res) => {
        promiseResult = res;
      });

      const modal = await screen.findByTestId('media-modal');
      expect(modal).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByTestId('modal-apply-success'));
      });

      expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();
      expect(promiseResult).toEqual({
        selected: {
          kind: 'gallery',
          src: 'https://example.com/mock-image.png',
          id: '1',
          fileName: 'mock',
          locale: 'en'
        },
        crop: null,
        uploadResult: undefined
      });
    });

    it('should resolve the promise with null and close the modal when Cancel is clicked', async () => {
      render(<BlockNoteEditor />);
      await screen.findByTestId('blocknote-editor');

      let promiseResult: MediaModalResult | null | undefined = undefined;
      await act(async () => {
        fireEvent.click(screen.getByTestId('trigger-slash-menu'));
      });

      captureSlashMenuOpenMediaModal!().then((res) => {
        promiseResult = res;
      });

      expect(await screen.findByTestId('media-modal')).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByTestId('modal-close'));
      });

      expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();
      expect(promiseResult).toBeNull();
    });
  });

  describe('5. Paste Behaviour', () => {
    it('should allow to paste valid plain text', () => {
      render(<BlockNoteEditor />);
      const correctPlainText = 'dfsdfsd';
      const event = {
        clipboardData: {
          getData: (type: 'text/html' | 'text/plain') => {
            if (type === 'text/plain') return correctPlainText;
            return null;
          }
        }
      };

      const defaultPasteHandler = jest.fn();
      capturedCreateOptions?.pasteHandler({ event, editor: mockEditor, defaultPasteHandler });
      expect(mockEditor.insertInlineContent).toHaveBeenCalledWith(correctPlainText);
    });

    it('should allow to paste valid html', () => {
      render(<BlockNoteEditor />);
      const correctHTML = '<p>dfsdfsd</p>';
      const event = {
        clipboardData: {
          getData: (type: 'text/html' | 'text/plain') => {
            if (type === 'text/html') return correctHTML;
            return null;
          }
        }
      };

      const mockParsedBlocks = createMockParsedBlocks('dfsdfsd');
      mockEditor.tryParseHTMLToBlocks.mockReturnValueOnce(mockParsedBlocks);

      const defaultPasteHandler = jest.fn();
      capturedCreateOptions?.pasteHandler({ event, editor: mockEditor, defaultPasteHandler });
      expect(mockEditor.tryParseHTMLToBlocks).toHaveBeenCalledWith(correctHTML);
      expect(mockEditor.insertInlineContent).toHaveBeenCalledWith(mockParsedBlocks[0].content);
    });


    it('should remove emojiis and special symbols like (😀 🎉 ★ ♞ ♣) from pasted text and show error toast', () => {
      render(<BlockNoteEditor />);
      const invalidPlainText = 'Test 😀 🎉 ★ ♞ ♣';
      const event = {
        clipboardData: {
          getData: (type: 'text/html' | 'text/plain') => {
            if (type === 'text/plain') return invalidPlainText;
            return null;
          }
        }
      };
      const sanitizedText = 'Test';

      const defaultPasteHandler = jest.fn();
      capturedCreateOptions?.pasteHandler({ event, editor: mockEditor, defaultPasteHandler });

      expect(toast.error).toHaveBeenCalledWith('Використання емодзі та спецсимволів не дозволено');
      expect(mockEditor.insertInlineContent).toHaveBeenCalledWith(sanitizedText);
    });


    it('should remove any styles & emojiis or special symblos from pasted HTML and show error toast', () => {
      render(<BlockNoteEditor />);
      const formattedHTML = '<p style={} class={}>test 😀 🎉 ★ ♞ ♣</p>';
      const event = {
        clipboardData: {
          getData: (type: 'text/html' | 'text/plain') => {
            if (type === 'text/html') return formattedHTML;
            return null;
          }
        }
      };
      const mockParsedBlocks = createMockParsedBlocks('test');
      mockEditor.tryParseHTMLToBlocks.mockReturnValueOnce(mockParsedBlocks);
      const defaultPasteHandler = jest.fn();
      capturedCreateOptions?.pasteHandler({ event, editor: mockEditor, defaultPasteHandler });

      expect(mockEditor.tryParseHTMLToBlocks).toHaveBeenCalledWith('<p>test </p>');
      expect(mockEditor.insertInlineContent).toHaveBeenCalledWith(mockParsedBlocks[0].content);
    });
  });
});