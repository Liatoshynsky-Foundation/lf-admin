import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { GalleryFilters } from '../../flow/MediaModalFlowState';
import { MockFilterDropdown, MockMediaGrid, MockSearchButton } from '../../test-utils/sharedMocks';
import { GalleryView } from './GalleryView';
import { useGalleryFiles } from '~/shared/hooks/use-galllery-photo/useGallery';
import { useAllAssetsQuery } from '~/types/graphql/generated/graphql';

jest.mock('../../components/search-button/SearchButton', () => ({
  SearchButton: MockSearchButton
}));

jest.mock('../../components/filter-dropdown/FilterDropdown', () => ({
  FilterDropdown: MockFilterDropdown
}));

jest.mock('../../components/media-grid/MediaGrid', () => ({
  MediaGrid: MockMediaGrid
}));

jest.mock('../../components/gallery-card/GalleryCard', () => ({
  GalleryCard: ({ fileName, onClick, testId }: { fileName: string; onClick: () => void; testId: string }) => (
    <button data-testid={testId} onClick={onClick}>
      {fileName}
    </button>
  )
}));

jest.mock('~/shared/hooks/use-galllery-photo/useGallery', () => ({
  useGalleryFiles: jest.fn()
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  AssetType: { Image: 'IMAGE', Audio: 'AUDIO', Pdf: 'PDF' },
  useAllAssetsQuery: jest.fn()
}));

const mockFiles = [
  {
    filename: 'piano-studio.jpg',
    originalName: 'piano-studio.jpg',
    mimeType: 'image/jpeg',
    size: 1000,
    createdAt: '2024-01-03T00:00:00.000Z',
    url: 'https://example.com/piano-studio.jpg'
  },
  {
    filename: 'composer-portrait.jpg',
    originalName: 'composer-portrait.jpg',
    mimeType: 'image/jpeg',
    size: 1000,
    createdAt: '2024-01-02T00:00:00.000Z',
    url: 'https://example.com/composer-portrait.jpg'
  },
  {
    filename: 'archive-documents.jpg',
    originalName: 'archive-documents.jpg',
    mimeType: 'image/jpeg',
    size: 1000,
    createdAt: '2024-01-01T00:00:00.000Z',
    url: 'https://example.com/archive-documents.jpg'
  }
];

describe('GalleryView', () => {
  const mockOnPick = jest.fn();
  const mockOnFiltersChange = jest.fn();
  const mockFilters: GalleryFilters = { search: '', favorites: '', usage: '' };

  const renderGalleryView = (filtersOverride: Partial<GalleryFilters> = {}) =>
    render(
      <GalleryView
        selected={null}
        onPick={mockOnPick}
        filters={{ ...mockFilters, ...filtersOverride }}
        onFiltersChange={mockOnFiltersChange}
      />
    );

  beforeEach(() => {
    mockOnPick.mockClear();
    mockOnFiltersChange.mockClear();
    (useGalleryFiles as jest.Mock).mockReturnValue({ files: mockFiles, isLoading: false, error: null });
    (useAllAssetsQuery as jest.Mock).mockReturnValue({ data: undefined, loading: false });
  });

  it('should render gallery view with title', () => {
    renderGalleryView();
    expect(screen.getByText('Усі зображення')).toBeInTheDocument();
  });

  it('should render search button', () => {
    renderGalleryView();
    expect(screen.getByTestId('GalleryView-search')).toBeInTheDocument();
  });

  it('should render filter dropdowns', () => {
    renderGalleryView();
    expect(screen.getByTestId('GalleryView-favoritesFilter')).toBeInTheDocument();
    expect(screen.getByTestId('GalleryView-usageFilter')).toBeInTheDocument();
  });

  it('should render media grid with mock assets', () => {
    renderGalleryView();
    expect(screen.getByTestId('mocked-media-grid')).toBeInTheDocument();
  });

  it('should render multiple gallery cards', () => {
    renderGalleryView();
    expect(screen.getByText('piano-studio.jpg')).toBeInTheDocument();
    expect(screen.getByText('composer-portrait.jpg')).toBeInTheDocument();
    expect(screen.getByText('archive-documents.jpg')).toBeInTheDocument();
  });

  it('should call onPick when card is clicked', async () => {
    const user = userEvent.setup();
    renderGalleryView();

    await user.click(screen.getByText('piano-studio.jpg'));

    expect(mockOnPick).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'gallery', fileName: 'piano-studio.jpg', locale: 'uk' })
    );
  });

  it('should handle multiple card clicks', async () => {
    const user = userEvent.setup();
    renderGalleryView();

    await user.click(screen.getByText('piano-studio.jpg'));
    await user.click(screen.getByText('composer-portrait.jpg'));

    expect(mockOnPick).toHaveBeenCalledTimes(2);
  });

  it('should call onFiltersChange when typing in search', async () => {
    const user = userEvent.setup();
    renderGalleryView();

    await user.type(screen.getByTestId('GalleryView-search'), 'a');

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: 'a' });
  });

  it('should call onFiltersChange when clearing search', async () => {
    const user = userEvent.setup();
    render(
      <GalleryView
        selected={null}
        onPick={mockOnPick}
        filters={{ search: 'test', favorites: '', usage: '' }}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    await user.clear(screen.getByTestId('GalleryView-search'));

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: '' });
  });

  it('should show loading state when files are loading', () => {
    (useGalleryFiles as jest.Mock).mockReturnValue({ files: [], isLoading: true, error: null });
    renderGalleryView();

    expect(screen.getByText('Завантаження...')).toBeInTheDocument();
    expect(screen.queryByTestId('mocked-media-grid')).not.toBeInTheDocument();
  });

  it('should show loading state when assets are loading', () => {
    (useAllAssetsQuery as jest.Mock).mockReturnValue({ data: undefined, loading: true });
    renderGalleryView();

    expect(screen.getByText('Завантаження...')).toBeInTheDocument();
  });

  it('should filter out non-starred items when favorites filter is starred', () => {
    renderGalleryView({ favorites: 'starred' });
    expect(screen.queryByText('piano-studio.jpg')).not.toBeInTheDocument();
  });

  it('should show all items when favorites filter is not-starred', () => {
    renderGalleryView({ favorites: 'not-starred' });
    expect(screen.getByText('piano-studio.jpg')).toBeInTheDocument();
    expect(screen.getByText('composer-portrait.jpg')).toBeInTheDocument();
  });

  it('should show all items when favorites filter is an unknown value', () => {
    renderGalleryView({ favorites: 'unknown-filter-value' });
    expect(screen.getByText('piano-studio.jpg')).toBeInTheDocument();
  });

  it('should show all items when usage filter is unused', () => {
    renderGalleryView({ usage: 'unused' });
    expect(screen.getByText('piano-studio.jpg')).toBeInTheDocument();
    expect(screen.getByText('composer-portrait.jpg')).toBeInTheDocument();
    expect(screen.getByText('archive-documents.jpg')).toBeInTheDocument();
  });

  it('should filter out items not matching usage page', () => {
    renderGalleryView({ usage: 'news' });
    expect(screen.queryByText('piano-studio.jpg')).not.toBeInTheDocument();
  });

  it('should show starred items and compute usage locations from asset data', () => {
    (useAllAssetsQuery as jest.Mock).mockReturnValue({
      data: {
        allAssets: [
          {
            id: 'asset-1',
            url: 'https://example.com/piano-studio.jpg',
            filename: 'piano-studio.jpg',
            isStarred: true,
            tags: [],
            usageRefs: [
              { pageId: 'news', blockId: null },
              { pageId: 'unknown-page', blockId: null },
              { pageId: null, blockId: null }
            ]
          }
        ]
      },
      loading: false
    });

    renderGalleryView({ favorites: 'starred' });

    expect(screen.getByText('piano-studio.jpg')).toBeInTheDocument();
    expect(screen.queryByText('composer-portrait.jpg')).not.toBeInTheDocument();
  });

  it('should render the audio gallery and list only audio files for mediaKind="audio"', () => {
    (useGalleryFiles as jest.Mock).mockReturnValue({
      files: [
        {
          filename: 'song.mp3',
          originalName: 'song.mp3',
          mimeType: 'audio/mpeg',
          size: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          url: 'https://example.com/song.mp3'
        },
        {
          filename: 'cover.jpg',
          originalName: 'cover.jpg',
          mimeType: 'image/jpeg',
          size: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          url: 'https://example.com/cover.jpg'
        }
      ],
      isLoading: false,
      error: null
    });

    render(
      <GalleryView
        selected={null}
        onPick={mockOnPick}
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        mediaKind="audio"
      />
    );

    expect(screen.getByText('Усі аудіо')).toBeInTheDocument();
    expect(useGalleryFiles).toHaveBeenCalledWith('compositions');
    expect(screen.getByText('song.mp3')).toBeInTheDocument();
    expect(screen.queryByText('cover.jpg')).not.toBeInTheDocument();
  });

  it('should match items by usage page from asset usageRefs', () => {
    (useAllAssetsQuery as jest.Mock).mockReturnValue({
      data: {
        allAssets: [
          {
            id: 'asset-1',
            url: 'https://example.com/piano-studio.jpg',
            filename: 'piano-studio.jpg',
            isStarred: false,
            tags: [],
            usageRefs: [{ pageId: 'news', blockId: null }]
          }
        ]
      },
      loading: false
    });

    renderGalleryView({ usage: 'news' });

    expect(screen.getByText('piano-studio.jpg')).toBeInTheDocument();
    expect(screen.queryByText('composer-portrait.jpg')).not.toBeInTheDocument();
  });
});
