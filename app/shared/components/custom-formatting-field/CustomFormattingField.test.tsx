import { fireEvent, render, screen } from '@testing-library/react';
import { Editor,JSONContent } from '@tiptap/react';
import React from 'react';

import { CustomFormattingField } from './CustomFormattingField';

type EditorConfig = {
  content: JSONContent;
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
    <div
      data-testid="editor-content"
      onFocus={() => mockEditorConfig.onFocus()}
      onBlur={() => mockEditorConfig.onBlur()}
      onInput={() => mockEditorConfig.onUpdate({ editor: mockEditor })}
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
  });

  describe('3. Value Synchronization', () => {
    it('should call onChange with updated JSON when the editor content changes', () => {
      const updatedJSON: JSONContent = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] };
      mockGetJSON.mockReturnValue(updatedJSON);

      render(<CustomFormattingField value={defaultJSON} onChange={mockOnChange} />);
      const editorContent = screen.getByTestId('editor-content');

      fireEvent.input(editorContent);

      expect(mockGetJSON).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith(updatedJSON);
    });

    it('should call editor.commands.setContent when the external value prop changes', () => {
      const { rerender } = render(<CustomFormattingField value={defaultJSON} onChange={mockOnChange} />);

      expect(mockSetContent).toHaveBeenCalledWith(defaultJSON, { emitUpdate: false });
      mockSetContent.mockClear();

      const newJSON: JSONContent = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'New content from parent' }] }] };
      rerender(<CustomFormattingField value={newJSON} onChange={mockOnChange} />);

      expect(mockSetContent).toHaveBeenCalledTimes(1);
      expect(mockSetContent).toHaveBeenCalledWith(newJSON, { emitUpdate: false });
    });
  });
});
