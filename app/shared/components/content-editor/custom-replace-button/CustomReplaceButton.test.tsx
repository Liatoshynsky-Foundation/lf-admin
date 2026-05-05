import { useSelectedBlocks } from '@blocknote/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { MediaModalResult } from '../../media-modal/MediaModal.types';
import { CustomReplaceButton } from './CustomReplaceButton';
import { CropResult } from '~/types/common';

type MockBlock = { id: string; type: string };
type ButtonProps = { label: string; onClick: () => void };

const mockUpdateBlock = jest.fn();

jest.mock('lucide-react', () => ({ Replace: () => <span data-testid="replace-icon" /> }));

jest.mock('@blocknote/react', () => ({
  useBlockNoteEditor: () => ({ updateBlock: mockUpdateBlock }),
  useComponentsContext: () => ({
    FormattingToolbar: {
      Button: ({ label, onClick }: ButtonProps) => (
        <button data-testid="formatting-toolbar-btn" onClick={onClick}>{label}</button>
      )
    }
  }),
  useSelectedBlocks: jest.fn()
}));

describe('CustomReplaceButton', () => {
  const mockOpenMediaModal = jest.fn<Promise<MediaModalResult | null>, []>();

  const renderComponent = () => render(<CustomReplaceButton openMediaModal={mockOpenMediaModal} />);
  const setMockBlocks = (blocks: MockBlock[]) => (useSelectedBlocks as jest.Mock).mockReturnValue(blocks);
  const clickButton = () => fireEvent.click(screen.getByTestId('formatting-toolbar-btn'));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Visibility & Rendering Rules', () => {
    const expectEmptyDOM = () => expect(renderComponent().container).toBeEmptyDOMElement();

    it('should return null and not render if no blocks are selected', () => {
      setMockBlocks([]);
      expectEmptyDOM();
    });

    it('should return null and not render if multiple blocks are selected', () => {
      setMockBlocks([ { id: '1', type: 'image' }, { id: '2', type: 'image' } ]);
      expectEmptyDOM();
    });

    it('should return null and not render if the selected block is not an image', () => {
      setMockBlocks([{ id: '1', type: 'paragraph' }]);
      expectEmptyDOM();
    });

    it('should render the button if exactly one "image" block is selected', () => {
      setMockBlocks([{ id: 'img-1', type: 'image' }]);
      renderComponent();
      
      expect(screen.getByTestId('formatting-toolbar-btn')).toBeInTheDocument();
      expect(screen.getByText('Replace image')).toBeInTheDocument();
    });
  });

  describe('Interaction & Modal Flow', () => {
    beforeEach(() => {
      setMockBlocks([{ id: 'target-block-id', type: 'image' }]);
    });

    const triggerModalFlow = (modalResult: MediaModalResult | null) => {
      mockOpenMediaModal.mockResolvedValue(modalResult);
      renderComponent();
      clickButton();
    };

    const expectNoUpdate = async (modalResult: MediaModalResult | null) => {
      triggerModalFlow(modalResult);
      await waitFor(() => {
        expect(mockOpenMediaModal).toHaveBeenCalled();
        expect(mockUpdateBlock).not.toHaveBeenCalled();
      });
    };

    const expectUpdate = async (modalResult: MediaModalResult, expectedProps: Record<string, any>) => {
      triggerModalFlow(modalResult);
      await waitFor(() => {
        expect(mockUpdateBlock).toHaveBeenCalledTimes(1);
        expect(mockUpdateBlock).toHaveBeenCalledWith('target-block-id', {
          type: 'image',
          props: expectedProps
        });
      });
    };

    it('should call openMediaModal when clicked', () => {
      triggerModalFlow(null);
      expect(mockOpenMediaModal).toHaveBeenCalledTimes(1);
    });

    it('should not update the block if the modal is cancelled (returns null)', async () => {
      await expectNoUpdate(null);
    });

    it('should not update the block if the modal returns an upload without a valid uploadResult', async () => {
      await expectNoUpdate({
        selected: { kind: 'upload', id: 'up-1', fileName: 'err.jpg', file: new File([], 'err.jpg') },
        crop: null,
        uploadResult: undefined
      });
    });

    it('should update the block correctly when an uploaded image is successfully returned', async () => {
      await expectUpdate({
        selected: { kind: 'upload', id: 'up-2', fileName: 'my-uploaded-file.jpg', file: new File([], 'my-uploaded-file.jpg') },
        crop: { width: 500, height: 500, x: 10, y: 10 } as unknown as CropResult,
        uploadResult: { url: 'https://example.com/uploaded.jpg', filename: 'hash.jpg', originalName: 'file.jpg', mimeType: 'image/jpeg', size: 1024 }
      }, {
        url: 'https://example.com/uploaded.jpg',
        cropData: JSON.stringify({ width: 500, height: 500, x: 10, y: 10 }),
        fileName: 'my-uploaded-file.jpg'
      });
    });

    it('should update the block correctly when a gallery image is selected', async () => {
      await expectUpdate({
        selected: { kind: 'gallery', id: 'gal-1', src: 'https://example.com/gallery-img.png', fileName: 'gallery-pic.png', locale: 'en' },
        crop: null,
        uploadResult: undefined
      }, {
        url: 'https://example.com/gallery-img.png',
        cropData: '{}',
        fileName: 'gallery-pic.png'
      });
    });

    it('should fallback to "image" if fileName is falsy', async () => {
      await expectUpdate({
        selected: { kind: 'used', id: 'usd-1', src: 'https://example.com/no-name.png', fileName: '', locale: 'uk' },
        crop: null,
        uploadResult: undefined
      }, {
        url: 'https://example.com/no-name.png',
        cropData: '{}',
        fileName: 'image'
      });
    });
  });
});
