import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { FileMenuActions } from './FileMenuActions';

jest.mock('lucide-react', () => ({ Info: () => <svg data-testid="InfoIcon" /> }));
jest.mock('~/public/icons/pen-line.svg', () => ({ __esModule: true, default: () => <svg data-testid="EditIcon" /> }));
jest.mock('~/public/icons/small-star.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="StarIcon" />
}));
jest.mock('~/public/icons/download.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="DownloadIcon" />
}));
jest.mock('~/public/icons/empty-trash.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="DeleteIcon" />
}));

describe('FileMenuActions', () => {
  const defaultProps = {
    isStarred: false,
    onCloseMenu: jest.fn(),
    onOpenDetails: jest.fn(),
    onRename: jest.fn(),
    onToggleStar: jest.fn(),
    onDownload: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all menu items with correct text', () => {
    render(<FileMenuActions {...defaultProps} />);

    expect(screen.getByText('Відкрити деталі')).toBeInTheDocument();
    expect(screen.getByText('Перейменувати')).toBeInTheDocument();
    expect(screen.getByText('Додати в обрані')).toBeInTheDocument();
    expect(screen.getByText('Завантажити')).toBeInTheDocument();
    expect(screen.getByText('Видалити')).toBeInTheDocument();
  });

  it('renders "Забрати з обраних" when file is starred', () => {
    render(<FileMenuActions {...defaultProps} isStarred={true} />);
    expect(screen.getByText('Забрати з обраних')).toBeInTheDocument();
  });

  it('calls correct action and onCloseMenu when an item is clicked', () => {
    render(<FileMenuActions {...defaultProps} />);

    fireEvent.click(screen.getByText('Відкрити деталі'));
    expect(defaultProps.onOpenDetails).toHaveBeenCalledTimes(1);
    expect(defaultProps.onCloseMenu).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Перейменувати'));
    expect(defaultProps.onRename).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Видалити'));
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Додати в обрані'));
    expect(defaultProps.onToggleStar).toHaveBeenCalledTimes(1);
  });
});
