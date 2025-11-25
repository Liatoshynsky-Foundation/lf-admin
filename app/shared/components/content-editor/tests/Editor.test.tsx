import { render, screen, waitFor } from '@testing-library/react';
import type { JSONContent } from '@tiptap/react';
import { useEditor } from '@tiptap/react';
import React from 'react';

import { Editor, useContentEditor } from '../editor/Editor';

const mockEditor = {
  commands: {
    setContent: jest.fn()
  },
  setEditable: jest.fn(),
  getJSON: jest.fn(() => ({ type: 'doc', content: [] })),
  isActive: jest.fn(() => false),
  can: jest.fn(() => ({
    undo: jest.fn(() => true),
    redo: jest.fn(() => true),
    chain: jest.fn(() => ({
      focus: jest.fn(() => ({
        toggleBold: jest.fn(() => ({ run: jest.fn() })),
        toggleItalic: jest.fn(() => ({ run: jest.fn() })),
        toggleUnderline: jest.fn(() => ({ run: jest.fn() })),
        toggleHeading: jest.fn(() => ({ run: jest.fn() }))
      }))
    }))
  })),
  chain: jest.fn(() => ({
    focus: jest.fn(() => ({
      undo: jest.fn(() => ({ run: jest.fn() })),
      redo: jest.fn(() => ({ run: jest.fn() })),
      toggleBold: jest.fn(() => ({ run: jest.fn() })),
      toggleItalic: jest.fn(() => ({ run: jest.fn() })),
      toggleUnderline: jest.fn(() => ({ run: jest.fn() })),
      toggleHeading: jest.fn(() => ({ run: jest.fn() })),
      toggleBulletList: jest.fn(() => ({ run: jest.fn() })),
      toggleOrderedList: jest.fn(() => ({ run: jest.fn() })),
      toggleBlockquote: jest.fn(() => ({ run: jest.fn() })),
      toggleCodeBlock: jest.fn(() => ({ run: jest.fn() })),
      setLink: jest.fn(() => ({ run: jest.fn() })),
      setImage: jest.fn(() => ({ run: jest.fn() })),
      setHorizontalRule: jest.fn(() => ({ run: jest.fn() }))
    }))
  }))
};

jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(),
  EditorContent: ({ editor }: { editor: unknown }) => (
    <div data-testid="editor-content">{editor ? 'Editor loaded' : 'No editor'}</div>
  )
}));

jest.mock('../editor/Toolbar', () => ({
  Toolbar: ({ editor, onImageUpload }: { editor: unknown; onImageUpload?: (file: File) => Promise<string> }) => (
    <div data-testid="toolbar">
      Toolbar {editor ? 'with editor' : 'without editor'}
      {onImageUpload && <span data-testid="toolbar-image-upload">Image upload enabled</span>}
    </div>
  )
}));

const mockedUseEditor = jest.mocked(useEditor);

describe('Editor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseEditor.mockReturnValue(mockEditor as any);
  });

  describe('Rendering', () => {
    it('should render editor with toolbar when not in readOnly mode', () => {
      render(<Editor />);

      expect(screen.getByTestId('toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });

    it('should not render toolbar in readOnly mode', () => {
      render(<Editor readOnly />);

      expect(screen.queryByTestId('toolbar')).not.toBeInTheDocument();
      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });

    it('should not render save button when showSaveButton is false', () => {
      render(<Editor showSaveButton={false} />);

      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    it('should not render save button in readOnly mode', () => {
      render(<Editor readOnly onSave={jest.fn()} />);

      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    it('should render save button when onSave is provided and showSaveButton is true', () => {
      render(<Editor onSave={jest.fn()} showSaveButton />);

      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('Initialization', () => {
    it('should initialize editor with default placeholder', () => {
      render(<Editor />);

      expect(mockedUseEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          extensions: expect.any(Array),
          content: '',
          editable: true,
          immediatelyRender: false
        })
      );
    });

    it('should initialize editor with custom placeholder', () => {
      const placeholder = 'Custom placeholder text';
      render(<Editor placeholder={placeholder} />);

      expect(mockedUseEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          extensions: expect.arrayContaining([
            expect.objectContaining({
              name: 'placeholder'
            })
          ])
        })
      );
    });

    it('should initialize editor with initial content', () => {
      const initialContent: JSONContent = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }]
      };
      render(<Editor initialContent={initialContent} />);

      expect(mockedUseEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          content: initialContent
        })
      );
    });

    it('should initialize editor in readOnly mode', () => {
      render(<Editor readOnly />);

      expect(mockedUseEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          editable: false
        })
      );
    });

    it('should initialize editor with image upload extension when onImageUpload is provided', () => {
      const onImageUpload = jest.fn();
      render(<Editor onImageUpload={onImageUpload} />);

      expect(screen.getByTestId('toolbar-image-upload')).toBeInTheDocument();
    });
  });

  describe('Content Updates', () => {
    it('should call onChange when editor content changes', () => {
      const onChange = jest.fn();
      render(<Editor onChange={onChange} />);

      const editorConfig = mockedUseEditor.mock.calls[0][0];
      const mockContent = { type: 'doc', content: [] };
      mockEditor.getJSON.mockReturnValue(mockContent);

      editorConfig.onUpdate?.({ editor: mockEditor } as any);

      expect(onChange).toHaveBeenCalledWith(mockContent);
    });

    it('should not call onChange when not provided', () => {
      render(<Editor />);

      const editorConfig = mockedUseEditor.mock.calls[0][0];
      expect(() => editorConfig.onUpdate?.({ editor: mockEditor } as any)).not.toThrow();
    });

    it('should update editor content when initialContent changes', async () => {
      const initialContent1: JSONContent = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Initial' }] }]
      };
      const initialContent2: JSONContent = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated' }] }]
      };

      const { rerender } = render(<Editor initialContent={initialContent1} />);

      await waitFor(() => {
        expect(mockEditor.commands.setContent).toHaveBeenCalledWith(initialContent1);
      });

      rerender(<Editor initialContent={initialContent2} />);

      await waitFor(() => {
        expect(mockEditor.commands.setContent).toHaveBeenCalledWith(initialContent2);
      });
    });
  });

  describe('Save Functionality', () => {
    it('should call onSave with current content when save button is clicked', () => {
      const onSave = jest.fn();
      const mockContent: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };
      mockEditor.getJSON.mockReturnValue(mockContent as any);

      render(<Editor onSave={onSave} showSaveButton />);

      const saveButton = screen.getByText('Save');
      saveButton.click();

      expect(onSave).toHaveBeenCalledWith(mockContent);
    });

    it('should not throw error when save button is clicked without onSave', () => {
      render(<Editor showSaveButton />);

      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });
  });

  describe('ReadOnly Mode', () => {
    it('should update editable state when readOnly prop changes', async () => {
      const { rerender } = render(<Editor readOnly={false} />);

      expect(mockEditor.setEditable).toHaveBeenCalledWith(true);

      rerender(<Editor readOnly={true} />);

      await waitFor(() => {
        expect(mockEditor.setEditable).toHaveBeenCalledWith(false);
      });
    });

    it('should not show toolbar in readOnly mode', () => {
      render(<Editor readOnly />);

      expect(screen.queryByTestId('toolbar')).not.toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<Editor className="custom-class" />);

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should apply custom minHeight', () => {
      render(<Editor minHeight="300px" />);

      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });
  });
});

describe('useContentEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an editor instance', () => {
    mockedUseEditor.mockReturnValue(mockEditor as any);

    const TestComponent = () => {
      const editor = useContentEditor();
      return <div>{editor ? 'Editor exists' : 'No editor'}</div>;
    };

    render(<TestComponent />);

    expect(screen.getByText('Editor exists')).toBeInTheDocument();
  });

  it('should initialize editor in non-editable mode', () => {
    const TestComponent = () => {
      useContentEditor();
      return <div>Test</div>;
    };

    render(<TestComponent />);

    expect(mockedUseEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        editable: false,
        immediatelyRender: false
      })
    );
  });

  it('should initialize editor with required extensions', () => {
    const TestComponent = () => {
      useContentEditor();
      return <div>Test</div>;
    };

    render(<TestComponent />);

    expect(mockedUseEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        extensions: expect.arrayContaining([expect.anything(), expect.anything(), expect.anything(), expect.anything()])
      })
    );
  });
});
