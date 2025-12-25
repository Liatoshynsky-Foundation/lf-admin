import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { GalleryView } from './GalleryView';

jest.mock('../../components/search-button/SearchButton', () => ({
  SearchButton: ({ value, onSearch, testId }: any) => (
    <input data-testid={testId} value={value} onChange={(e) => onSearch(e.target.value)} placeholder="Search" />
  )
}));

jest.mock('../../components/filter-button/FilterButton', () => ({
  FilterButton: ({ label, onClick, testId }: any) => (
    <button data-testid={testId} onClick={onClick}>
      {label}
    </button>
  )
}));

jest.mock('../../components/media-grid/MediaGrid', () => ({
  MediaGrid: ({ items, renderCard }: any) => (
    <div data-testid="mocked-media-grid" role="grid">
      {items.map((item: any, index: number) => (
        <div key={item._id}>{renderCard(item, index)}</div>
      ))}
    </div>
  )
}));

jest.mock('../../components/media-card/GalleryCard', () => ({
  GalleryCard: ({ fileName, onClick, testId }: any) => (
    <button data-testid={testId} onClick={onClick}>
      {fileName}
    </button>
  )
}));

describe('GalleryView', () => {
  const mockOnPick = jest.fn();

  beforeEach(() => {
    mockOnPick.mockClear();
  });

  it('should render gallery view with title', () => {
    render(<GalleryView selected={null} onPick={mockOnPick} />);

    expect(screen.getByText('Усі зображення')).toBeInTheDocument();
  });

  it('should render search button', () => {
    render(<GalleryView selected={null} onPick={mockOnPick} />);

    expect(screen.getByTestId('GalleryView-search')).toBeInTheDocument();
  });

  it('should render filter buttons', () => {
    render(<GalleryView selected={null} onPick={mockOnPick} />);

    expect(screen.getByTestId('GalleryView-filterFavorites')).toBeInTheDocument();
    expect(screen.getByTestId('GalleryView-filterUsage')).toBeInTheDocument();
  });

  it('should render media grid with mock assets', () => {
    render(<GalleryView selected={null} onPick={mockOnPick} />);

    expect(screen.getByTestId('mocked-media-grid')).toBeInTheDocument();
  });

  it('should call onPick when card is clicked', async () => {
    const user = userEvent.setup();
    render(<GalleryView selected={null} onPick={mockOnPick} />);

    const firstCard = screen.getByText('piano-studio.jpg');
    await user.click(firstCard);

    expect(mockOnPick).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'gallery',
        fileName: 'piano-studio.jpg',
        locale: 'uk'
      })
    );
  });

  it('should update search value when typing', async () => {
    const user = userEvent.setup();
    render(<GalleryView selected={null} onPick={mockOnPick} />);

    const searchInput = screen.getByTestId('GalleryView-search');
    await user.type(searchInput, 'test search');

    expect(searchInput).toHaveValue('test search');
  });

  it('should render multiple gallery cards', () => {
    render(<GalleryView selected={null} onPick={mockOnPick} />);

    expect(screen.getByText('piano-studio.jpg')).toBeInTheDocument();
    expect(screen.getByText('composer-portrait.jpg')).toBeInTheDocument();
    expect(screen.getByText('archive-documents.jpg')).toBeInTheDocument();
  });

  it('should handle multiple card clicks', async () => {
    const user = userEvent.setup();
    render(<GalleryView selected={null} onPick={mockOnPick} />);

    const firstCard = screen.getByText('piano-studio.jpg');
    const secondCard = screen.getByText('composer-portrait.jpg');

    await user.click(firstCard);
    await user.click(secondCard);

    expect(mockOnPick).toHaveBeenCalledTimes(2);
  });

  it('should clear search value', async () => {
    const user = userEvent.setup();
    render(<GalleryView selected={null} onPick={mockOnPick} />);

    const searchInput = screen.getByTestId('GalleryView-search');
    await user.type(searchInput, 'test');
    await user.clear(searchInput);

    expect(searchInput).toHaveValue('');
  });
});
