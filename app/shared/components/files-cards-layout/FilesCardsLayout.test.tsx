import { fireEvent, render, screen } from '@testing-library/react';

import { FilesCardsLayout, type FilesCardsLayoutItem } from './FilesCardsLayout';

jest.mock('~/types/graphql/generated/graphql', () => ({
  ...jest.requireActual('~/types/graphql/generated/graphql'),
  useUpdateAssetMutation: () => [jest.fn(), { loading: false }]
}));

jest.mock('~/shared/components/file-card', () => ({
  __esModule: true,
  default: ({
    isSelected,
    onAction,
    onClick,
    onToggleStar
  }: {
    isSelected?: boolean;
    onAction?: (action: 'rename' | 'delete' | 'download') => void;
    onClick?: () => void;
    onToggleStar?: (id: string, next: boolean) => void;
  }) => (
    <div data-selected={isSelected} data-testid="mock-file-card">
      <button type="button" onClick={onClick}>
        file card
      </button>
      <button type="button" onClick={() => onAction?.('rename')}>
        grid rename
      </button>
      <button type="button" onClick={() => onToggleStar?.('1', true)}>
        grid star
      </button>
    </div>
  )
}));

jest.mock('~/shared/components/minimized-file-card/MinimizedFileCard', () => ({
  __esModule: true,
  default: ({
    isSelected,
    onAction,
    onClick,
    onToggleStar
  }: {
    isSelected?: boolean;
    onAction?: (action: 'rename' | 'delete' | 'download') => void;
    onClick?: () => void;
    onToggleStar?: (id: string, next: boolean) => void;
  }) => (
    <div data-selected={isSelected} data-testid="mock-minimized-file-card">
      <button type="button" onClick={onClick}>
        minimized file card
      </button>
      <button type="button" onClick={() => onAction?.('delete')}>
        list delete
      </button>
      <button type="button" onClick={() => onToggleStar?.('2', false)}>
        list unstar
      </button>
    </div>
  )
}));

describe('FilesCardsLayout', () => {
  const FALLBACK_IMAGE_SRC = 'https://pub-2b50c59c64954ab89b7837f9f4607e12.r2.dev/photos/about-us-foundation-first.png';

  const items: FilesCardsLayoutItem[] = [
    {
      id: '1',
      type: 'image',
      name: 'image-1.jpg',
      dateAdded: '2026-03-01',
      usageLinks: 2,
      imageSrc: FALLBACK_IMAGE_SRC
    },
    {
      id: '2',
      type: 'pdf',
      name: 'report.pdf',
      dateAdded: '2026-03-02'
    }
  ];

  it('renders standard cards in grid view', () => {
    render(<FilesCardsLayout view="grid" items={items} />);

    expect(screen.getByTestId('FilesCardsLayout-grid')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-file-card')).toHaveLength(2);
    expect(screen.queryByTestId('mock-minimized-file-card')).not.toBeInTheDocument();
  });

  it('renders minimized cards in list view', () => {
    render(<FilesCardsLayout view="list" items={items} />);

    expect(screen.getByTestId('FilesCardsLayout-list')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-minimized-file-card')).toHaveLength(2);
    expect(screen.queryByTestId('mock-file-card')).not.toBeInTheDocument();
  });

  it('calls onItemClick in grid view', () => {
    const onItemClick = jest.fn();

    render(<FilesCardsLayout view="grid" items={items} onItemClick={onItemClick} />);

    fireEvent.click(screen.getAllByText('file card')[0]);

    expect(onItemClick).toHaveBeenCalledWith(items[0]);
  });

  it('calls onItemClick in list view', () => {
    const onItemClick = jest.fn();

    render(<FilesCardsLayout view="list" items={items} onItemClick={onItemClick} />);

    fireEvent.click(screen.getAllByText('minimized file card')[1]);

    expect(onItemClick).toHaveBeenCalledWith(items[1]);
  });

  it('passes selected state and item actions in grid view', () => {
    const onItemAction = jest.fn();
    const onItemToggleStar = jest.fn();

    render(
      <FilesCardsLayout
        view="grid"
        items={items}
        selectedItemId="1"
        onItemAction={onItemAction}
        onItemToggleStar={onItemToggleStar}
      />
    );

    expect(screen.getAllByTestId('mock-file-card')[0]).toHaveAttribute('data-selected', 'true');

    fireEvent.click(screen.getAllByText('grid rename')[0]);
    fireEvent.click(screen.getAllByText('grid star')[0]);

    expect(onItemAction).toHaveBeenCalledWith('rename', items[0]);
    expect(onItemToggleStar).toHaveBeenCalledWith(items[0], true);
  });

  it('passes selected state and item actions in list view', () => {
    const onItemAction = jest.fn();
    const onItemToggleStar = jest.fn();

    render(
      <FilesCardsLayout
        view="list"
        items={items}
        selectedItemId="2"
        onItemAction={onItemAction}
        onItemToggleStar={onItemToggleStar}
      />
    );

    expect(screen.getAllByTestId('mock-minimized-file-card')[1]).toHaveAttribute('data-selected', 'true');

    fireEvent.click(screen.getAllByText('list delete')[1]);
    fireEvent.click(screen.getAllByText('list unstar')[1]);

    expect(onItemAction).toHaveBeenCalledWith('delete', items[1]);
    expect(onItemToggleStar).toHaveBeenCalledWith(items[1], false);
  });
});
