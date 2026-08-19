import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import type { GalleryFilters } from '../../flow/MediaModalFlowState';
import { MockMediaGrid, MockSearchButton } from '../../test-utils/sharedMocks';
import { GalleryView } from './GalleryView';
import { useGalleryFiles } from '~/shared/hooks/use-galllery-photo/useGallery';
import { useAllAssetsQuery } from '~/types/graphql/generated/graphql';

jest.mock('../../components/search-button/SearchButton', () => ({
  SearchButton: MockSearchButton
}));

jest.mock('../../components/filter-dropdown/FilterDropdown', () => ({
  FilterDropdown: ({ onChange, testId }: { onChange: (val: string) => void; testId: string }) => (
    <select data-testid={testId} onChange={(e) => onChange(e.target.value)}>
      <option value="">All</option>
      <option value="starred">Starred</option>
      <option value="news">News</option>
    </select>
  )
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
  let originalError: typeof console.error;
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    const consoleObj = globalThis['console'];
    originalError = consoleObj.error;
    consoleErrorSpy = jest.spyOn(consoleObj, 'error').mockImplementation((...args) => {
      const firstArg = args[0];
      if (
        typeof firstArg === 'string' &&
        (firstArg.includes('warning-keys') || firstArg.includes('unique "key" prop'))
      ) {
        return;
      }
      originalError.apply(consoleObj, args);
    });
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

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

  it('should render empty state when image array is empty after loading', () => {
    (useGalleryFiles as jest.Mock).mockReturnValue({ files: [], isLoading: false, error: null });

    renderGalleryView();

    expect(screen.getByTestId('GalleryView-emptyState')).toBeInTheDocument();
    expect(screen.getByText('Зображень не знайдено. Спробуйте додати зображення до медіатеки.')).toBeInTheDocument();
    expect(screen.queryByTestId('mocked-media-grid')).not.toBeInTheDocument();
  });

  it('should render empty state when search returns no gallery items', () => {
    renderGalleryView({ search: 'missing-image' });

    expect(screen.getByTestId('GalleryView-emptyState')).toBeInTheDocument();
    expect(screen.queryByTestId('mocked-media-grid')).not.toBeInTheDocument();
  });

  it('should render media-kind specific empty state for pdf gallery', () => {
    (useGalleryFiles as jest.Mock).mockReturnValue({ files: [], isLoading: false, error: null });

    render(
      <GalleryView
        selected={null}
        onPick={mockOnPick}
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        mediaKind="pdf"
      />
    );

    expect(screen.getByText('Файлів не знайдено. Спробуйте додати файли до медіатеки.')).toBeInTheDocument();
  });

  it('should render media-kind specific empty state for audio gallery', () => {
    (useGalleryFiles as jest.Mock).mockReturnValue({ files: [], isLoading: false, error: null });

    render(
      <GalleryView
        selected={null}
        onPick={mockOnPick}
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        mediaKind="audio"
      />
    );

    expect(screen.getByText('Аудіофайлів не знайдено. Спробуйте додати аудіофайли до медіатеки.')).toBeInTheDocument();
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

  it.each([
    ['audio', 'recording.mp3', 'audio/mpeg', 'AUDIO'],
    ['pdf', 'score.pdf', 'application/pdf', 'PDF']
  ] as const)('should use Asset MIME metadata for generic R2 listings in the %s gallery', (mediaKind, filename, mimeType, assetType) => {
    const url = `https://example.com/${filename}`;

    (useGalleryFiles as jest.Mock).mockReturnValue({
      files: [
        {
          filename,
          originalName: filename,
          mimeType: 'application/octet-stream',
          size: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          url
        }
      ],
      isLoading: false,
      error: null
    });
    (useAllAssetsQuery as jest.Mock).mockReturnValue({
      data: {
        allAssets: [{
          id: `asset-${mediaKind}`,
          type: assetType,
          mimeType,
          url,
          filename,
          originalname: filename,
          isStarred: false,
          tags: [],
          usageRefs: []
        }]
      },
      loading: false
    });

    render(
      <GalleryView
        selected={null}
        onPick={mockOnPick}
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        mediaKind={mediaKind}
      />
    );

    expect(screen.getByText(filename)).toBeInTheDocument();
  });

  it.each([
    ['audio', 'recording.mp3', 'image/jpeg'],
    ['pdf', 'score.pdf', 'audio/mpeg']
  ] as const)('should reject a %s file when Asset MIME metadata conflicts', (mediaKind, filename, mimeType) => {
    const url = `https://example.com/${filename}`;

    (useGalleryFiles as jest.Mock).mockReturnValue({
      files: [{
        filename,
        originalName: filename,
        mimeType: 'application/octet-stream',
        size: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        url
      }],
      isLoading: false,
      error: null
    });
    (useAllAssetsQuery as jest.Mock).mockReturnValue({
      data: {
        allAssets: [{
          id: `asset-${mediaKind}-conflict`,
          type: 'IMAGE',
          mimeType,
          url,
          filename,
          isStarred: false,
          tags: [],
          usageRefs: []
        }]
      },
      loading: false
    });

    render(
      <GalleryView
        selected={null}
        onPick={mockOnPick}
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        mediaKind={mediaKind}
      />
    );

    expect(screen.queryByText(filename)).not.toBeInTheDocument();
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

  it('should display originalname instead of filename when available', () => {
    (useAllAssetsQuery as jest.Mock).mockReturnValue({
      data: {
        allAssets: [
          {
            id: 'asset-1',
            url: 'https://example.com/piano-studio.jpg',
            filename: '1234567890-hash.jpg',
            originalname: 'piano-studio.jpg',
            isStarred: false,
            tags: [],
            usageRefs: []
          }
        ]
      },
      loading: false
    });

    renderGalleryView();

    expect(screen.getByText('piano-studio.jpg')).toBeInTheDocument();
    expect(screen.queryByText('1234567890-hash.jpg')).not.toBeInTheDocument();
  });

  it('should fall back to filename when originalname is missing', () => {
    (useAllAssetsQuery as jest.Mock).mockReturnValue({
      data: {
        allAssets: [
          {
            id: 'asset-1',
            url: 'https://example.com/piano-studio.jpg',
            filename: 'piano-studio.jpg',
            isStarred: false,
            tags: [],
            usageRefs: []
          }
        ]
      },
      loading: false
    });

    renderGalleryView();

    expect(screen.getByText('piano-studio.jpg')).toBeInTheDocument();
  });

  it('should call onFiltersChange when favorites or usage dropdown value changes', () => {
    renderGalleryView();

    const favoritesFilter = screen.getByTestId('GalleryView-favoritesFilter');
    const usageFilter = screen.getByTestId('GalleryView-usageFilter');

    fireEvent.change(favoritesFilter, { target: { value: 'starred' } });
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ favorites: 'starred' });

    fireEvent.change(usageFilter, { target: { value: 'news' } });
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ usage: 'news' });
  });

  it('should handle files with undefined mimeType and filename when matching audio mediaKind', () => {
    (useGalleryFiles as jest.Mock).mockReturnValue({
      files: [
        {
          url: 'https://example.com/file-without-type.mp3',
          createdAt: '2024-01-01T00:00:00.000Z',
          path: 'file-without-type.mp3'
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
  });
});
