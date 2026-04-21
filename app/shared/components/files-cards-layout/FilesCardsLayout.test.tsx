import { fireEvent, render, screen } from '@testing-library/react';

import { FilesCardsLayout, type FilesCardsLayoutItem } from './FilesCardsLayout';

jest.mock('~/types/graphql/generated/graphql', () => ({
  ...jest.requireActual('~/types/graphql/generated/graphql'),
  useUpdateAssetMutation: () => [jest.fn(), { loading: false }]
}));

jest.mock('~/shared/components/file-card', () => ({
  __esModule: true,
  default: ({ onClick }: { onClick?: () => void }) => (
    <button type="button" data-testid="mock-file-card" onClick={onClick}>
      file card
    </button>
  )
}));

jest.mock('~/shared/components/minimized-file-card/MinimizedFileCard', () => ({
  __esModule: true,
  default: ({ onClick }: { onClick?: () => void }) => (
    <button type="button" data-testid="mock-minimized-file-card" onClick={onClick}>
      minimized file card
    </button>
  )
}));

describe('FilesCardsLayout', () => {
  const items: FilesCardsLayoutItem[] = [
    {
      id: '1',
      type: 'image',
      name: 'image-1.jpg',
      dateAdded: '2026-03-01',
      usageLinks: 2,
      imageSrc: '/images/foundation-first.png'
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

    fireEvent.click(screen.getAllByTestId('mock-file-card')[0]);

    expect(onItemClick).toHaveBeenCalledWith(items[0]);
  });

  it('calls onItemClick in list view', () => {
    const onItemClick = jest.fn();

    render(<FilesCardsLayout view="list" items={items} onItemClick={onItemClick} />);

    fireEvent.click(screen.getAllByTestId('mock-minimized-file-card')[1]);

    expect(onItemClick).toHaveBeenCalledWith(items[1]);
  });
});
