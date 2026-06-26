import { blockTypeSelectItems, getFormattingToolbarItems, useBlockNoteEditor } from '@blocknote/react';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { MediaModalResult } from '../../media-modal/MediaModal.types';
import { CustomFormattingToolbar } from './CustomFormattingToolbar';

type ToolbarItem = {
  key: string;
  type?: string;
};

jest.mock('@blocknote/react', () => ({
  useBlockNoteEditor: jest.fn(),
  blockTypeSelectItems: jest.fn(),
  getFormattingToolbarItems: jest.fn(),
  FormattingToolbar: ({ children }: { children: (React.ReactElement | ToolbarItem)[] }) => (
    <div data-testid="formatting-toolbar">
      {Array.isArray(children)
        ? children.map((child, idx) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { key: child.key || String(idx) } as React.Attributes);
          }
            
          const item = child as ToolbarItem;
          return <span key={item.key || String(idx)} data-testid={`default-item-${item.key}`}>{item.key}</span>;
        })
        : null}
    </div>
  )
}));

jest.mock('../custom-replace-button/CustomReplaceButton', () => ({
  CustomReplaceButton: ({ openMediaModal }: { openMediaModal: () => Promise<MediaModalResult | null> }) => (
    <button data-testid="custom-replace-button" onClick={openMediaModal}>
      Replace
    </button>
  )
}));

describe('CustomFormattingToolbar', () => {
  const mockOpenMediaModal = jest.fn<Promise<MediaModalResult | null>, []>();
  const mockDictionary = { some: 'dict' };

  beforeEach(() => {
    jest.clearAllMocks();

    (useBlockNoteEditor as jest.Mock).mockReturnValue({ dictionary: mockDictionary });
    (blockTypeSelectItems as jest.Mock).mockReturnValue([
      { type: 'paragraph', name: 'Paragraph' },
      { type: 'numberedListItem', name: 'Numbered List' },
      { type: 'heading', name: 'Heading 1' },
      { type: 'heading', name: 'Toggle Heading 1' },
      { type: 'quote', name: 'Quote' },
      { type: 'toggleListItem', name: 'Toggle List Item' }
    ]);
  });

  it('should filter out specific block types and names from defaultDropdownItems', () => {
    (getFormattingToolbarItems as jest.Mock).mockReturnValue([]);

    render(<CustomFormattingToolbar openMediaModal={mockOpenMediaModal} />);

    expect(blockTypeSelectItems).toHaveBeenCalledWith(mockDictionary);
    expect(getFormattingToolbarItems).toHaveBeenCalledWith([
      { type: 'paragraph', name: 'Paragraph' },
      { type: 'numberedListItem', name: 'Numbered List' },
      { type: 'heading', name: 'Heading 1' },
    ]);
  });

  it('should strip away specific buttons from the main toolbar items (strike, color, nest, unnest)', () => {
    (getFormattingToolbarItems as jest.Mock).mockReturnValue([
      { key: 'boldButton' },
      { key: 'strikeStyleButton' },
      { key: 'colorStyleButton' },
      { key: 'nestBlockButton' },
      { key: 'unnestBlockButton' },
      { key: 'italicButton' }
    ]);

    render(<CustomFormattingToolbar openMediaModal={mockOpenMediaModal} />);

    expect(screen.getByTestId('default-item-boldButton')).toBeInTheDocument();
    expect(screen.getByTestId('default-item-italicButton')).toBeInTheDocument();

    expect(screen.queryByTestId('default-item-strikeStyleButton')).not.toBeInTheDocument();
    expect(screen.queryByTestId('default-item-colorStyleButton')).not.toBeInTheDocument();
    expect(screen.queryByTestId('default-item-nestBlockButton')).not.toBeInTheDocument();
    expect(screen.queryByTestId('default-item-unnestBlockButton')).not.toBeInTheDocument();
  });

  it('should render standard items and not inject CustomReplaceButton if replaceFileButton is missing', () => {
    (getFormattingToolbarItems as jest.Mock).mockReturnValue([
      { key: 'boldButton' },
      { key: 'italicButton' }
    ]);

    render(<CustomFormattingToolbar openMediaModal={mockOpenMediaModal} />);

    expect(screen.getByTestId('formatting-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('default-item-boldButton')).toBeInTheDocument();
    expect(screen.getByTestId('default-item-italicButton')).toBeInTheDocument();
    expect(screen.queryByTestId('custom-replace-button')).not.toBeInTheDocument();
  });

  it('should replace replaceFileButton with CustomReplaceButton and pass down openMediaModal', () => {
    (getFormattingToolbarItems as jest.Mock).mockReturnValue([
      { key: 'boldButton' },
      { key: 'replaceFileButton' },
      { key: 'italicButton' }
    ]);

    render(<CustomFormattingToolbar openMediaModal={mockOpenMediaModal} />);

    expect(screen.getByTestId('default-item-boldButton')).toBeInTheDocument();
    expect(screen.getByTestId('default-item-italicButton')).toBeInTheDocument();
    expect(screen.queryByTestId('default-item-replaceFileButton')).not.toBeInTheDocument();

    const customButton = screen.getByTestId('custom-replace-button');
    expect(customButton).toBeInTheDocument();

    fireEvent.click(customButton);
    expect(mockOpenMediaModal).toHaveBeenCalledTimes(1);
  });
});
