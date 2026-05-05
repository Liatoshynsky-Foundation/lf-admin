import { getFormattingToolbarItems } from '@blocknote/react';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { MediaModalResult } from '../../media-modal/MediaModal.types';
import { CustomFormattingToolbar } from './CustomFormattingToolbar';

type ToolbarItem = {
  key: string;
  type?: string;
};

jest.mock('@blocknote/react', () => ({
  getFormattingToolbarItems: jest.fn(),
  FormattingToolbar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="formatting-toolbar">
      {React.Children.map(children, (child, idx) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { key: child.key || String(idx) } as React.Attributes);
        }
        
        const item = child as unknown as ToolbarItem;
        return <span key={item.key || String(idx)} data-testid={`default-item-${item.key}`}>{item.key}</span>;
      })}
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

  beforeEach(() => {
    jest.clearAllMocks();
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
