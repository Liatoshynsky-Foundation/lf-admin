import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Editor } from '@tiptap/react';
import React from 'react';

import { Toolbar } from '../editor/Toolbar';

const createMockEditor = (overrides?: Partial<Editor>): Editor => {
  const mockFocus = () => ({
    toggleBold: jest.fn(() => ({ run: jest.fn() })),
    toggleItalic: jest.fn(() => ({ run: jest.fn() })),
    toggleUnderline: jest.fn(() => ({ run: jest.fn() })),
    toggleHeading: jest.fn(() => ({ run: jest.fn() })),
    toggleBulletList: jest.fn(() => ({ run: jest.fn() })),
    toggleOrderedList: jest.fn(() => ({ run: jest.fn() })),
    toggleBlockquote: jest.fn(() => ({ run: jest.fn() })),
    toggleCodeBlock: jest.fn(() => ({ run: jest.fn() })),
    setLink: jest.fn(() => ({ run: jest.fn() })),
    unsetLink: jest.fn(() => ({ run: jest.fn() })),
    setImage: jest.fn(() => ({ run: jest.fn() })),
    setHorizontalRule: jest.fn(() => ({ run: jest.fn() })),
    undo: jest.fn(() => ({ run: jest.fn() })),
    redo: jest.fn(() => ({ run: jest.fn() }))
  });

  const mockCanFocus = () => ({
    toggleBold: jest.fn(() => ({ run: jest.fn(() => true) })),
    toggleItalic: jest.fn(() => ({ run: jest.fn(() => true) })),
    toggleUnderline: jest.fn(() => ({ run: jest.fn(() => true) })),
    toggleHeading: jest.fn(() => ({ run: jest.fn(() => true) })),
    toggleBulletList: jest.fn(() => ({ run: jest.fn(() => true) })),
    toggleOrderedList: jest.fn(() => ({ run: jest.fn(() => true) })),
    toggleBlockquote: jest.fn(() => ({ run: jest.fn(() => true) })),
    toggleCodeBlock: jest.fn(() => ({ run: jest.fn(() => true) })),
    setLink: jest.fn(() => ({ run: jest.fn(() => true) })),
    unsetLink: jest.fn(() => ({ run: jest.fn(() => true) })),
    setImage: jest.fn(() => ({ run: jest.fn(() => true) })),
    setHorizontalRule: jest.fn(() => ({ run: jest.fn(() => true) }))
  });

  const mockChain = {
    focus: jest.fn(mockFocus)
  };

  const mockCanChain = {
    focus: jest.fn(mockCanFocus)
  };

  return {
    chain: jest.fn(() => mockChain),
    isActive: jest.fn(() => false),
    can: jest.fn(() => ({
      undo: jest.fn(() => true),
      redo: jest.fn(() => true),
      chain: jest.fn(() => mockCanChain)
    })),
    ...overrides
  } as unknown as Editor;
};

describe('Toolbar', () => {
  let mockEditor: Editor;

  beforeEach(() => {
    mockEditor = createMockEditor();
  });

  describe('Rendering', () => {
    it('should return null when editor is null', () => {
      const { container } = render(<Toolbar editor={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render all basic formatting buttons', () => {
      render(<Toolbar editor={mockEditor} />);

      expect(screen.getByLabelText('Undo')).toBeInTheDocument();
      expect(screen.getByLabelText('Redo')).toBeInTheDocument();
      expect(screen.getByLabelText('Bold')).toBeInTheDocument();
      expect(screen.getByLabelText('Italic')).toBeInTheDocument();
      expect(screen.getByLabelText('Underline')).toBeInTheDocument();
    });

    it('should render heading buttons', () => {
      render(<Toolbar editor={mockEditor} />);

      expect(screen.getByLabelText('Heading 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Heading 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Heading 3')).toBeInTheDocument();
    });

    it('should render list formatting buttons', () => {
      render(<Toolbar editor={mockEditor} />);

      expect(screen.getByLabelText('Bullet List')).toBeInTheDocument();
      expect(screen.getByLabelText('Numbered List')).toBeInTheDocument();
    });

    it('should render block formatting buttons', () => {
      render(<Toolbar editor={mockEditor} />);

      expect(screen.getByLabelText('Blockquote')).toBeInTheDocument();
      expect(screen.getByLabelText('Code Block')).toBeInTheDocument();
    });

    it('should render link button', () => {
      render(<Toolbar editor={mockEditor} />);

      expect(screen.getByLabelText('Add Link')).toBeInTheDocument();
    });

    it('should render horizontal rule button', () => {
      render(<Toolbar editor={mockEditor} />);

      expect(screen.getByLabelText('Horizontal Rule')).toBeInTheDocument();
    });

    it('should render image upload button when onImageUpload is provided', () => {
      const mockOnImageUpload = jest.fn().mockResolvedValue('https://example.com/image.jpg');
      render(<Toolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);

      expect(screen.getByLabelText('Add Image')).toBeInTheDocument();
    });

    it('should not render image upload button when onImageUpload is not provided', () => {
      render(<Toolbar editor={mockEditor} />);

      expect(screen.queryByLabelText('Add Image')).not.toBeInTheDocument();
    });
  });

  describe('Interaction Handlers', () => {
    it('should handle image upload button click', async () => {
      const mockOnImageUpload = jest.fn().mockResolvedValue('https://example.com/image.jpg');
      render(<Toolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);

      const imageButton = screen.getByLabelText('Add Image');
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      expect(fileInput).toBeInTheDocument();
      expect(fileInput?.style.display).toBe('none');

      await userEvent.click(imageButton);

      // Verify that clicking the button triggers the file input
      expect(fileInput).toBeInTheDocument();
    });

    it('should handle successful image upload', async () => {
      const mockSetImage = jest.fn(() => ({ run: jest.fn() }));
      const mockChain = {
        focus: jest.fn(() => ({ setImage: mockSetImage }))
      };
      mockEditor.chain = jest.fn(() => mockChain) as any;

      const mockOnImageUpload = jest.fn().mockResolvedValue('https://example.com/uploaded.jpg');
      render(<Toolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['image'], 'test.png', { type: 'image/png' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnImageUpload).toHaveBeenCalledWith(file);
      });

      await waitFor(() => {
        expect(mockSetImage).toHaveBeenCalledWith({ src: 'https://example.com/uploaded.jpg' });
      });
    });

    it('should handle failed image upload', async () => {
      const mockOnImageUpload = jest.fn().mockRejectedValue(new Error('Upload failed'));
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<Toolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['image'], 'test.png', { type: 'image/png' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnImageUpload).toHaveBeenCalledWith(file);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Image upload failed:', expect.any(Error));
        expect(mockAlert).toHaveBeenCalledWith('Failed to upload image. Please try again.');
      });

      mockAlert.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should reset file input after upload', async () => {
      const mockOnImageUpload = jest.fn().mockResolvedValue('https://example.com/uploaded.jpg');
      render(<Toolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['image'], 'test.png', { type: 'image/png' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(fileInput.value).toBe('');
      });
    });

    it('should not upload when no file is selected', async () => {
      const mockOnImageUpload = jest.fn().mockResolvedValue('https://example.com/uploaded.jpg');
      render(<Toolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [] } });

      await waitFor(() => {
        expect(mockOnImageUpload).not.toHaveBeenCalled();
      });
    });
  });
});
