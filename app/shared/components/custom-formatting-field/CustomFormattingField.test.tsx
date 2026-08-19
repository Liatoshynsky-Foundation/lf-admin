import { fireEvent, render, screen } from '@testing-library/react';
import { Editor,JSONContent } from '@tiptap/react';
import React from 'react';

import { CustomFormattingField } from './CustomFormattingField';

type EditorConfig = {
  content: JSONContent;
  extensions: Array<{ name?: string; config?: { content?: string } }>;
  onUpdate: (props: { editor: Editor }) => void;
  onFocus: () => void;
  onBlur: () => void;
};

let mockEditorConfig: EditorConfig;

const mockFocus = jest.fn();
const mockSetContent = jest.fn();
const mockGetJSON = jest.fn();

const mockEditor = {
  getJSON: mockGetJSON,
  isEmpty: true,
  commands: {
    focus: mockFocus,
    setContent: mockSetContent
  }
} as unknown as Editor;

jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn((config: EditorConfig) => {
    mockEditorConfig = config;
    return mockEditor;
  }),
  EditorContent: () => (
    <textarea
      data-testid="editor-content"
      onFocus={() => mockEditorConfig.onFocus()}
      onBlur={() => mockEditorConfig.onBlur()}
      onInput={() => mockEditorConfig.onUpdate({ editor: mockEditor })}
      style={{ display: 'none' }} 
    />
  ),
  useCurrentEditor: jest.fn(() => ({ editor: mockEditor }))
}));

jest.mock('@tiptap/react/menus', () => ({
  BubbleMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bubble-menu">{children}</div>
  )
}));

jest.mock('./formatting-toolbar/FormattingToolbar', () => ({
  FormattingToolbar: () => <div data-testid="formatting-toolbar" />
}));

jest.mock('~/lib/utils/sxToArray', () => ({
  sxToArray: (sx: unknown) => (Array.isArray(sx) ? sx : [sx].filter(Boolean))
}));

describe('CustomFormattingField', () => {
  const mockOnChange = jest.fn();
  const defaultJSON: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(mockEditor, 'isEmpty', { value: true, configurable: true });
    mockGetJSON.mockReturnValue(defaultJSON);
  });

  it('allows multiple paragraphs in the document schema', () => {
    render(<CustomFormattingField value={defaultJSON} onChange={mockOnChange} />);

    const documentExtension = mockEditorConfig.extensions.find((extension) => extension.name === 'doc');

    expect(documentExtension?.config?.content).toMatch(/\+$/);
  });

  describe('1. Mounting & Rendering', () => {
    it('should render correctly with the default label', () => {
      render(<CustomFormattingField value={defaultJSON} onChange={mockOnChange} />);

      const labelElements = screen.getAllByText('Текст');
      expect(labelElements.length).toBeGreaterThan(0);

      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
      expect(screen.getByTestId('bubble-menu')).toBeInTheDocument();
      expect(screen.getByTestId('formatting-toolbar')).toBeInTheDocument();
    });

    it('should render with a custom label', () => {
      render(<CustomFormattingField value={defaultJSON} onChange={mockOnChange} label="Custom Label" />);

      const labelElements = screen.getAllByText('Custom Label');
      expect(labelElements.length).toBeGreaterThan(0);
      expect(screen.queryByText('Текст')).not.toBeInTheDocument();
    });
  });

  describe('2. Interactions', () => {
    it('should call editor.commands.focus() when the visible label is clicked', () => {
      render(<CustomFormattingField value={defaultJSON} onChange={mockOnChange} label="Clickable Label" />);

      const label = screen.getAllByText('Clickable Label')[0];
      fireEvent.click(label);

      expect(mockFocus).toHaveBeenCalledTimes(1);
    });

    it('should update the internal focused state on focus and blur', () => {
      render(<CustomFormattingField value={defaultJSON} onChange={mockOnChange} />);
      const editorContent = screen.getByTestId('editor-content');

      fireEvent.focus(editorContent);


      fireEvent.blur(editorContent);
    });

    it('should call the external onBlur prop when the editor loses focus', () => {
      const mockOnBlur = jest.fn();
      render(<CustomFormattingField value={defaultJSON} onChange={mockOnChange} onBlur={mockOnBlur} />);
      const editorContent = screen.getByTestId('editor-content');

      fireEvent.blur(editorContent);

      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });

    it('should not throw when the editor loses focus without an onBlur prop', () => {
      render(<CustomFormattingField value={defaultJSON} onChange={mockOnChange} />);
      const editorContent = screen.getByTestId('editor-content');

      expect(() => fireEvent.blur(editorContent)).not.toThrow();
    });
  });

  describe('4. Validation state', () => {
    it('should not render helper text when error is false', () => {
      render(<CustomFormattingField value={defaultJSON} onChange={mockOnChange} error={false} helperText="Заголовок не може бути порожнім" />);

      expect(screen.queryByTestId('formatting-field-error')).not.toBeInTheDocument();
    });

    it('should render helper text when error is true', () => {
      render(<CustomFormattingField value={defaultJSON} onChange={mockOnChange} error helperText="Заголовок не може бути порожнім" />);

      expect(screen.getByTestId('formatting-field-error')).toHaveTextContent('Заголовок не може бути порожнім');
    });

    it('should not render helper text when error is true but no helperText is provided', () => {
      render(<CustomFormattingField value={defaultJSON} onChange={mockOnChange} error />);

      expect(screen.queryByTestId('formatting-field-error')).not.toBeInTheDocument();
    });
  });

  describe('3. Value Synchronization', () => {
    it('should call onChange once with updated JSON when the editor content changes', () => {
      const updatedJSON: JSONContent = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] };
      mockGetJSON.mockReturnValue(updatedJSON);

      render(<CustomFormattingField value={defaultJSON} onChange={mockOnChange} />);
      const editorContent = screen.getByTestId('editor-content');

      fireEvent.input(editorContent);

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith(updatedJSON);
    });

    it('should call editor.getJSON twice when the editor content changes', () => {
      const updatedJSON: JSONContent = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] };
      mockGetJSON.mockReturnValue(updatedJSON);

      render(<CustomFormattingField value={defaultJSON} onChange={mockOnChange} />);
      const editorContent = screen.getByTestId('editor-content');

      fireEvent.input(editorContent);

      expect(mockGetJSON).toHaveBeenCalledTimes(2);
    });

    it('should call editor.commands.setContent ONLY when the external value prop changes', () => {
      const { rerender } = render(<CustomFormattingField value={defaultJSON} onChange={mockOnChange} />);
      
      expect(mockSetContent).not.toHaveBeenCalled();
      const newJSON: JSONContent = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'New content from parent' }] }] };
      rerender(<CustomFormattingField value={newJSON} onChange={mockOnChange} />);

      expect(mockSetContent).toHaveBeenCalledTimes(1);
      expect(mockSetContent).toHaveBeenCalledWith(newJSON, { emitUpdate: false });
    });
  });
});
