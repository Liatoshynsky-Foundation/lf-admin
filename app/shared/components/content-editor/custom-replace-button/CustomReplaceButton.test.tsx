import { useSelectedBlocks } from '@blocknote/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { MediaModalResult } from '../../media-modal/MediaModal.types';
import { CustomReplaceButton } from './CustomReplaceButton';
import { CropResult } from '~/types/common';

type MockBlock = {
  id: string;
  type: string;
};

type ButtonProps = {
  label: string;
  onClick: () => void;
};

const mockUpdateBlock = jest.fn();

jest.mock('lucide-react', () => ({
  Replace: () => <span data-testid="replace-icon" />
}));

jest.mock('@blocknote/react', () => ({
  useBlockNoteEditor: () => ({
    updateBlock: mockUpdateBlock
  }),
  useComponentsContext: () => ({
    FormattingToolbar: {
      Button: ({ label, onClick }: ButtonProps) => (
        <button data-testid="formatting-toolbar-btn" onClick={onClick}>
          {label}
        </button>
      )
    }
  }),
  useSelectedBlocks: jest.fn()
}));

describe('CustomReplaceButton', () => {
  const mockOpenMediaModal = jest.fn<Promise<MediaModalResult | null>, []>();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Visibility & Rendering Rules', () => {
    it('should return null and not render if no blocks are selected', () => {
      (useSelectedBlocks as jest.Mock).mockReturnValue([]);

      const { container } = render(<CustomReplaceButton openMediaModal={mockOpenMediaModal} />);
      
      expect(container).toBeEmptyDOMElement();
    });

    it('should return null and not render if multiple blocks are selected', () => {
      const selectedBlocks: MockBlock[] = [
        { id: '1', type: 'image' },
        { id: '2', type: 'image' }
      ];
      (useSelectedBlocks as jest.Mock).mockReturnValue(selectedBlocks);

      const { container } = render(<CustomReplaceButton openMediaModal={mockOpenMediaModal} />);
      
      expect(container).toBeEmptyDOMElement();
    });

    it('should return null and not render if the selected block is not an image or cropped-image', () => {
      const selectedBlocks: MockBlock[] = [{ id: '1', type: 'paragraph' }];
      (useSelectedBlocks as jest.Mock).mockReturnValue(selectedBlocks);

      const { container } = render(<CustomReplaceButton openMediaModal={mockOpenMediaModal} />);
      
      expect(container).toBeEmptyDOMElement();
    });

    it('should render the button if exactly one "image" block is selected', () => {
      const selectedBlocks: MockBlock[] = [{ id: 'img-1', type: 'image' }];
      (useSelectedBlocks as jest.Mock).mockReturnValue(selectedBlocks);

      render(<CustomReplaceButton openMediaModal={mockOpenMediaModal} />);
      
      expect(screen.getByTestId('formatting-toolbar-btn')).toBeInTheDocument();
      expect(screen.getByText('Replace image')).toBeInTheDocument();
    });

    it('should render the button if exactly one "cropped-image" block is selected', () => {
      const selectedBlocks: MockBlock[] = [{ id: 'img-1', type: 'cropped-image' }];
      (useSelectedBlocks as jest.Mock).mockReturnValue(selectedBlocks);

      render(<CustomReplaceButton openMediaModal={mockOpenMediaModal} />);
      
      expect(screen.getByTestId('formatting-toolbar-btn')).toBeInTheDocument();
    });
  });

  describe('Interaction & Modal Flow', () => {
    beforeEach(() => {
      const selectedBlocks: MockBlock[] = [{ id: 'target-block-id', type: 'image' }];
      (useSelectedBlocks as jest.Mock).mockReturnValue(selectedBlocks);
    });

    it('should call openMediaModal when clicked', async () => {
      mockOpenMediaModal.mockResolvedValue(null);
      render(<CustomReplaceButton openMediaModal={mockOpenMediaModal} />);

      fireEvent.click(screen.getByTestId('formatting-toolbar-btn'));

      expect(mockOpenMediaModal).toHaveBeenCalledTimes(1);
    });

    it('should not update the block if the modal is cancelled (returns null)', async () => {
      mockOpenMediaModal.mockResolvedValue(null);
      render(<CustomReplaceButton openMediaModal={mockOpenMediaModal} />);

      fireEvent.click(screen.getByTestId('formatting-toolbar-btn'));

      await waitFor(() => {
        expect(mockOpenMediaModal).toHaveBeenCalled();
        expect(mockUpdateBlock).not.toHaveBeenCalled();
      });
    });

    it('should not update the block if the modal returns an upload without a valid uploadResult', async () => {
      const mockResult: MediaModalResult = {
        selected: { 
          kind: 'upload', 
          id: 'up-1', 
          fileName: 'err.jpg', 
          file: new File([], 'err.jpg') 
        },
        crop: null,
        uploadResult: undefined 
      };
      
      mockOpenMediaModal.mockResolvedValue(mockResult);

      render(<CustomReplaceButton openMediaModal={mockOpenMediaModal} />);

      fireEvent.click(screen.getByTestId('formatting-toolbar-btn'));

      await waitFor(() => {
        expect(mockOpenMediaModal).toHaveBeenCalled();
        expect(mockUpdateBlock).not.toHaveBeenCalled();
      });
    });

    it('should update the block correctly when an uploaded image is successfully returned', async () => {
      const mockResult: MediaModalResult = {
        selected: { 
          kind: 'upload', 
          id: 'up-2', 
          fileName: 'my-uploaded-file.jpg', 
          file: new File([], 'my-uploaded-file.jpg') 
        },
        crop: { width: 500, height: 500, x: 10, y: 10 } as unknown as CropResult,
        uploadResult: { 
          url: 'https://example.com/uploaded.jpg',
          filename: 'hash-name.jpg',
          originalName: 'my-uploaded-file.jpg',
          mimeType: 'image/jpeg',
          size: 1024
        }
      };
      
      mockOpenMediaModal.mockResolvedValue(mockResult);

      render(<CustomReplaceButton openMediaModal={mockOpenMediaModal} />);

      fireEvent.click(screen.getByTestId('formatting-toolbar-btn'));

      await waitFor(() => {
        expect(mockUpdateBlock).toHaveBeenCalledTimes(1);
        expect(mockUpdateBlock).toHaveBeenCalledWith('target-block-id', {
          type: 'cropped-image',
          props: {
            url: 'https://example.com/uploaded.jpg',
            cropData: JSON.stringify({ width: 500, height: 500, x: 10, y: 10 }),
            fileName: 'my-uploaded-file.jpg'
          }
        });
      });
    });

    it('should update the block correctly when a gallery image is selected', async () => {
      const mockResult: MediaModalResult = {
        selected: { 
          kind: 'gallery', 
          id: 'gal-1', 
          src: 'https://example.com/gallery-img.png', 
          fileName: 'gallery-pic.png',
          locale: 'en'
        },
        crop: null, 
        uploadResult: undefined
      };
      
      mockOpenMediaModal.mockResolvedValue(mockResult);

      render(<CustomReplaceButton openMediaModal={mockOpenMediaModal} />);

      fireEvent.click(screen.getByTestId('formatting-toolbar-btn'));

      await waitFor(() => {
        expect(mockUpdateBlock).toHaveBeenCalledTimes(1);
        expect(mockUpdateBlock).toHaveBeenCalledWith('target-block-id', {
          type: 'cropped-image',
          props: {
            url: 'https://example.com/gallery-img.png',
            cropData: '{}', 
            fileName: 'gallery-pic.png'
          }
        });
      });
    });

    it('should fallback to "image" if fileName is falsy', async () => {
      const mockResult: MediaModalResult = {
        selected: { 
          kind: 'used', 
          id: 'usd-1', 
          src: 'https://example.com/no-name.png', 
          fileName: '', 
          locale: 'uk'
        },
        crop: null,
        uploadResult: undefined
      };
      
      mockOpenMediaModal.mockResolvedValue(mockResult);

      render(<CustomReplaceButton openMediaModal={mockOpenMediaModal} />);

      fireEvent.click(screen.getByTestId('formatting-toolbar-btn'));

      await waitFor(() => {
        expect(mockUpdateBlock).toHaveBeenCalledWith('target-block-id', {
          type: 'cropped-image',
          props: {
            url: 'https://example.com/no-name.png',
            cropData: '{}',
            fileName: 'image' 
          }
        });
      });
    });
  });
});
