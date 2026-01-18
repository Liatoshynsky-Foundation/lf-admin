import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { GalleryView } from './GalleryView';

jest.mock('../../components/search-button/SearchButton', () => ({
  SearchButton: ({ value, onSearch, testId }: { value: string; onSearch: (v: string) => void; testId: string }) => (
    <input data-testid={testId} value={value} onChange={(e) => onSearch(e.target.value)} placeholder="Search" />
  )
}));

jest.mock('../../components/filter-dropdown/FilterDropdown', () => ({
  FilterDropdown: ({
    label,
    value,
    onChange,
    testId
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    testId: string;
  }) => (
    <select data-testid={testId} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{label}</option>
    </select>
  )
}));

jest.mock('../../components/media-grid/MediaGrid', () => ({
  MediaGrid: ({
    items,
    renderCard
  }: {
    items: unknown[];
    renderCard: (item: unknown, index: number) => React.ReactNode;
  }) => (
    <div data-testid="mocked-media-grid" role="grid">
      {items.map((item: unknown, index: number) => (
        <div key={(item as { _id: string })._id}>{renderCard(item, index)}</div>
      ))}
    </div>
  )
}));

jest.mock('../../components/gallery-card/GalleryCard', () => ({
  GalleryCard: ({ fileName, onClick, testId }: { fileName: string; onClick: () => void; testId: string }) => (
    <button data-testid={testId} onClick={onClick}>
      {fileName}
    </button>
  )
}));

describe('GalleryView', () => {
  const mockOnPick = jest.fn();
  const mockOnFiltersChange = jest.fn();
  const mockFilters = {
    search: '',
    favorites: '',
    usage: ''
  };

  beforeEach(() => {
    mockOnPick.mockClear();
    mockOnFiltersChange.mockClear();
  });

  it('should render gallery view with title', () => {
    render(
      <GalleryView selected={null} onPick={mockOnPick} filters={mockFilters} onFiltersChange={mockOnFiltersChange} />
    );

    expect(screen.getByText('Усі зображення')).toBeInTheDocument();
  });

  it('should render search button', () => {
    render(
      <GalleryView selected={null} onPick={mockOnPick} filters={mockFilters} onFiltersChange={mockOnFiltersChange} />
    );

    expect(screen.getByTestId('GalleryView-search')).toBeInTheDocument();
  });

  it('should render filter dropdowns', () => {
    render(
      <GalleryView selected={null} onPick={mockOnPick} filters={mockFilters} onFiltersChange={mockOnFiltersChange} />
    );

    expect(screen.getByTestId('GalleryView-favoritesFilter')).toBeInTheDocument();
    expect(screen.getByTestId('GalleryView-usageFilter')).toBeInTheDocument();
  });

  it('should render media grid with mock assets', () => {
    render(
      <GalleryView selected={null} onPick={mockOnPick} filters={mockFilters} onFiltersChange={mockOnFiltersChange} />
    );

    expect(screen.getByTestId('mocked-media-grid')).toBeInTheDocument();
  });

  it('should call onPick when card is clicked', async () => {
    const user = userEvent.setup();
    render(
      <GalleryView selected={null} onPick={mockOnPick} filters={mockFilters} onFiltersChange={mockOnFiltersChange} />
    );

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

  it('should call onFiltersChange when typing in search', async () => {
    const user = userEvent.setup();
    render(
      <GalleryView selected={null} onPick={mockOnPick} filters={mockFilters} onFiltersChange={mockOnFiltersChange} />
    );

    const searchInput = screen.getByTestId('GalleryView-search');
    await user.type(searchInput, 'a');

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: 'a' });
  });

  it('should render multiple gallery cards', () => {
    render(
      <GalleryView selected={null} onPick={mockOnPick} filters={mockFilters} onFiltersChange={mockOnFiltersChange} />
    );

    expect(screen.getByText('piano-studio.jpg')).toBeInTheDocument();
    expect(screen.getByText('composer-portrait.jpg')).toBeInTheDocument();
    expect(screen.getByText('archive-documents.jpg')).toBeInTheDocument();
  });

  it('should handle multiple card clicks', async () => {
    const user = userEvent.setup();
    render(
      <GalleryView selected={null} onPick={mockOnPick} filters={mockFilters} onFiltersChange={mockOnFiltersChange} />
    );

    const firstCard = screen.getByText('piano-studio.jpg');
    const secondCard = screen.getByText('composer-portrait.jpg');

    await user.click(firstCard);
    await user.click(secondCard);

    expect(mockOnPick).toHaveBeenCalledTimes(2);
  });

  it('should call onFiltersChange when clearing search', async () => {
    const user = userEvent.setup();
    const filtersWithSearch = { search: 'test', favorites: '', usage: '' };
    render(
      <GalleryView
        selected={null}
        onPick={mockOnPick}
        filters={filtersWithSearch}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const searchInput = screen.getByTestId('GalleryView-search');
    await user.clear(searchInput);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: '' });
  });
});
