import { fireEvent,render, screen } from '@testing-library/react';

import { MediaPickList } from './MediaPickList';

interface TestItem {
  id: string;
  fileName: string;
  locale?: string;
}

describe('MediaPickList', () => {
  const mockItems: TestItem[] = [
    { id: '1', fileName: 'file1.jpg', locale: 'uk' },
    { id: '2', fileName: 'file2.jpg' }
  ];

  it('renders correctly with items', () => {
    const onPick = jest.fn();
    render(<MediaPickList items={mockItems} selectedId={null} testIdPrefix="media" onPick={onPick} />);

    expect(screen.getByTestId('media-1')).toBeInTheDocument();
    expect(screen.getByText('file1.jpg (uk)')).toBeInTheDocument();
    expect(screen.getByText('file2.jpg')).toBeInTheDocument();
  });

  it('sets correct variant for selected item', () => {
    const onPick = jest.fn();
    render(<MediaPickList items={mockItems} selectedId="1" testIdPrefix="media" onPick={onPick} />);

    const selectedButton = screen.getByTestId('media-1');
    const unselectedButton = screen.getByTestId('media-2');

    expect(selectedButton).toHaveAttribute('aria-pressed', 'true');
    expect(unselectedButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onPick when an item is clicked', () => {
    const onPick = jest.fn();
    render(<MediaPickList items={mockItems} selectedId={null} testIdPrefix="media" onPick={onPick} />);

    fireEvent.click(screen.getByTestId('media-2'));
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick).toHaveBeenCalledWith(mockItems[1]);
  });

  it('renders nothing if items array is empty', () => {
    const onPick = jest.fn();
    const { container } = render(<MediaPickList items={[]} selectedId={null} testIdPrefix="media" onPick={onPick} />);

    expect(container.firstChild?.childNodes).toHaveLength(0);
  });
});
