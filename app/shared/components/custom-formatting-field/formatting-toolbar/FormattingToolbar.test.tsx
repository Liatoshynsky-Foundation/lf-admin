import { act, fireEvent, render, screen } from '@testing-library/react';
import { Editor } from '@tiptap/react';
import React from 'react';

import { FormattingToolbar } from './FormattingToolbar';

jest.mock('lucide-react', () => ({
  Bold: () => <span data-testid="icon-bold" />,
  Italic: () => <span data-testid="icon-italic" />,
  Link: () => <span data-testid="icon-link" />
}));

jest.mock('~/lib/utils/sxToArray', () => ({
  sxToArray: (sx: unknown) => (Array.isArray(sx) ? sx : [sx].filter(Boolean))
}));

type MockChainParameters = {
  focus: jest.Mock;
  toggleMark: jest.Mock;
  extendMarkRange: jest.Mock;
  setLink: jest.Mock;
  unsetLink: jest.Mock;
  run: jest.Mock;
};

const createMockEditor = (
  overrides?: Partial<Editor> & { mockSelectionEmpty?: boolean }
) => {
  const chainSpies: MockChainParameters = {
    focus: jest.fn().mockReturnThis(),
    toggleMark: jest.fn().mockReturnThis(),
    extendMarkRange: jest.fn().mockReturnThis(),
    setLink: jest.fn().mockReturnThis(),
    unsetLink: jest.fn().mockReturnThis(),
    run: jest.fn()
  };

  const handlers: Record<string, () => void> = {};

  const editor = {
    isActive: jest.fn().mockReturnValue(false),
    getAttributes: jest.fn().mockReturnValue({}),
    state: {
      selection: { empty: overrides?.mockSelectionEmpty ?? false }
    },
    on: jest.fn((event: string, handler: () => void) => {
      handlers[event] = handler;
    }),
    off: jest.fn((event: string) => {
      delete handlers[event];
    }),
    chain: jest.fn(() => chainSpies),
    ...overrides
  } as unknown as Editor;

  return { editor, chainSpies, handlers };
};

describe('FormattingToolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should return null if editor is not provided', () => {
      const { container } = render(<FormattingToolbar editor={null} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('should render the toolbar buttons when editor is provided', () => {
      const { editor } = createMockEditor();
      render(<FormattingToolbar editor={editor} />);

      expect(screen.getByLabelText('bold')).toBeInTheDocument();
      expect(screen.getByLabelText('italic')).toBeInTheDocument();
      expect(screen.getByLabelText('link')).toBeInTheDocument();
    });
  });

  describe('Formatting Toggles (Bold / Italic)', () => {
    it('should show active state based on editor.isActive', () => {
      const { editor } = createMockEditor({
        isActive: jest.fn((mark) => mark === 'bold') 
      } as unknown as Editor);

      render(<FormattingToolbar editor={editor} />);

      const boldButton = screen.getByLabelText('bold');
      const italicButton = screen.getByLabelText('italic');

      expect(boldButton).toHaveAttribute('aria-pressed', 'true');
      expect(italicButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should trigger bold toggle chain when bold button is clicked', () => {
      const { editor, chainSpies } = createMockEditor();
      render(<FormattingToolbar editor={editor} />);

      fireEvent.click(screen.getByLabelText('bold'));

      expect(editor.chain).toHaveBeenCalled();
      expect(chainSpies.focus).toHaveBeenCalled();
      expect(chainSpies.toggleMark).toHaveBeenCalledWith('bold');
      expect(chainSpies.run).toHaveBeenCalled();
    });

    it('should trigger italic toggle chain when italic button is clicked', () => {
      const { editor, chainSpies } = createMockEditor();
      render(<FormattingToolbar editor={editor} />);

      fireEvent.click(screen.getByLabelText('italic'));

      expect(chainSpies.toggleMark).toHaveBeenCalledWith('italic');
      expect(chainSpies.run).toHaveBeenCalled();
    });
  });

  describe('Link Button Constraints', () => {
    it('should disable the link button if selection is empty and link is not active', () => {
      const { editor } = createMockEditor({ mockSelectionEmpty: true });
      render(<FormattingToolbar editor={editor} />);

      expect(screen.getByLabelText('link')).toBeDisabled();
    });

    it('should enable the link button if selection is NOT empty', () => {
      const { editor } = createMockEditor({ mockSelectionEmpty: false });
      render(<FormattingToolbar editor={editor} />);

      expect(screen.getByLabelText('link')).not.toBeDisabled();
    });

    it('should enable the link button if selection is empty BUT a link is active', () => {
      const { editor } = createMockEditor({
        mockSelectionEmpty: true,
        isActive: jest.fn((mark) => mark === 'link')
      } as unknown as Editor);

      render(<FormattingToolbar editor={editor} />);

      expect(screen.getByLabelText('link')).not.toBeDisabled();
    });
  });

  describe('Link Editing Flow', () => {
    it('should open the link input and pre-fill it if a link exists', () => {
      const { editor } = createMockEditor({
        getAttributes: jest.fn().mockReturnValue({ href: 'https://example.com' })
      } as unknown as Editor);

      render(<FormattingToolbar editor={editor} />);

      fireEvent.click(screen.getByLabelText('link'));

      const input = screen.getByPlaceholderText('Вставте гіперпосилання...') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('https://example.com');
      
      expect(screen.queryByLabelText('bold')).not.toBeInTheDocument();
    });

    it('should submit and apply the link when pressing Enter', () => {
      const { editor, chainSpies } = createMockEditor();
      render(<FormattingToolbar editor={editor} />);

      
      fireEvent.click(screen.getByLabelText('link'));
      const input = screen.getByPlaceholderText('Вставте гіперпосилання...');

      
      fireEvent.change(input, { target: { value: 'https://newlink.com' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(chainSpies.extendMarkRange).toHaveBeenCalledWith('link');
      expect(chainSpies.setLink).toHaveBeenCalledWith({ href: 'https://newlink.com' });
      expect(chainSpies.run).toHaveBeenCalled();

      expect(screen.queryByPlaceholderText('Вставте гіперпосилання...')).not.toBeInTheDocument();
      expect(screen.getByLabelText('bold')).toBeInTheDocument();
    });

    it('should submit and apply the link when blurring the input', () => {
      const { editor, chainSpies } = createMockEditor();
      render(<FormattingToolbar editor={editor} />);

      fireEvent.click(screen.getByLabelText('link'));
      const input = screen.getByPlaceholderText('Вставте гіперпосилання...');

      fireEvent.change(input, { target: { value: 'https://blurred.com' } });
      fireEvent.blur(input);

      expect(chainSpies.setLink).toHaveBeenCalledWith({ href: 'https://blurred.com' });
    });

    it('should unset the link if the submitted URL is empty', () => {
      const { editor, chainSpies } = createMockEditor();
      render(<FormattingToolbar editor={editor} />);

      fireEvent.click(screen.getByLabelText('link'));
      const input = screen.getByPlaceholderText('Вставте гіперпосилання...');

      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(chainSpies.extendMarkRange).toHaveBeenCalledWith('link');
      expect(chainSpies.unsetLink).toHaveBeenCalled();
      expect(chainSpies.run).toHaveBeenCalled();
    });

    it('should cancel link editing when the editor selection updates', () => {
      const { editor, handlers } = createMockEditor();
      render(<FormattingToolbar editor={editor} />);

      fireEvent.click(screen.getByLabelText('link'));
      expect(screen.getByPlaceholderText('Вставте гіперпосилання...')).toBeInTheDocument();

      act(() => {
        handlers['selectionUpdate']();
      });

      expect(screen.queryByPlaceholderText('Вставте гіперпосилання...')).not.toBeInTheDocument();
      expect(screen.getByLabelText('bold')).toBeInTheDocument();
    });
  });
});
