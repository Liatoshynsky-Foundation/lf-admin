'use client';

import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';

import { FilterDropdown } from '../../components/filter-dropdown/FilterDropdown';
import { GalleryCard } from '../../components/gallery-card/GalleryCard';
import { MediaGrid } from '../../components/media-grid/MediaGrid';
import { SearchButton } from '../../components/search-button/SearchButton';
import type { GalleryFilters } from '../../flow/MediaModalFlowState';
import type { GalleryMedia, MediaKind } from '../../MediaModal.types';
import { matchesAudio, matchesPdf } from '../../MediaModal.utils';
import { sharedViewStyles } from '../shared-view.styles';
import { useDebounce } from '~/hooks/use-debounce/useDebounce';
import { matchesSearch, sortByDateAndName } from '~/lib/utils/filterHelpers';
import { type GalleryFile, useGalleryFiles } from '~/shared/hooks/use-galllery-photo/useGallery';
import { AssetType, useAllAssetsQuery } from '~/types/graphql/generated/graphql';

type MediaKindConfig = {
  folder: string;
  assetType: AssetType;
  title: string;
  iconSrc?: string;
  matchesFile?: (mimeType: string, filename: string) => boolean;
};

const MEDIA_KIND_CONFIG: Record<MediaKind, MediaKindConfig> = {
  image: { folder: 'photos', assetType: AssetType.Image, title: 'Усі зображення' },
  audio: {
    folder: 'compositions',
    assetType: AssetType.Audio,
    title: 'Усі аудіо',
    iconSrc: '/icons/audio.svg',
    matchesFile: matchesAudio
  },
  pdf: {
    folder: 'uploads',
    assetType: AssetType.Pdf,
    title: 'Усі файли',
    iconSrc: '/icons/pdf.svg',
    matchesFile: matchesPdf
  }
};

type Props = Readonly<{
  selected: GalleryMedia | null;
  onPick: (selected: GalleryMedia) => void;
  filters: GalleryFilters;
  onFiltersChange: (filters: Partial<GalleryFilters>) => void;
  mediaKind?: MediaKind;
}>;

type GalleryItem = {
  id: string;
  filename: string;
  originalname?: string;
  url: string;
  isStarred: boolean;
  tags: string[];
  usageRefs: { pageId?: string | null; blockId?: string | null }[];
  createdAt: string;
};

const favoritesFilterOptions = [
  { value: 'starred', label: 'Із зірочкою' },
  { value: 'not-starred', label: 'Без зірочки' }
];

const usageFilterOptions = [
  { value: 'page', label: 'Основні сторінки' },
  { value: 'news', label: 'Новини' },
  { value: 'events', label: 'Події' },
  { value: 'opus', label: 'Опуси' },
  { value: 'archive', label: 'Архів' },
  { value: 'unused', label: 'Не використані' }
];

const getPageNames = (usageRefs: GalleryItem['usageRefs']): string[] => {
  const pageNameMap: Record<string, string> = {
    about: 'Про Фундацію',
    collaboration: 'Співпраця',
    news: 'Новини',
    events: 'Події'
  };
  return usageRefs.map((ref) => pageNameMap[ref.pageId ?? ''] ?? ref.pageId ?? '');
};

const matchesFavoritesFilter = (item: GalleryItem, filter: string): boolean => {
  if (!filter) return true;
  if (filter === 'starred') return item.isStarred;
  if (filter === 'not-starred') return !item.isStarred;
  return true;
};

const matchesUsageFilter = (item: GalleryItem, filter: string): boolean => {
  if (!filter) return true;
  if (filter === 'unused') return item.usageRefs.length === 0;
  return item.usageRefs.some((ref) => ref.pageId === filter);
};

export function GalleryView({ selected: _selected, onPick, filters, onFiltersChange, mediaKind = 'image' }: Props) {
  const config = MEDIA_KIND_CONFIG[mediaKind];
  const { files: r2Files, isLoading: r2Loading } = useGalleryFiles(config.folder);

  const { data: assetsData, loading: assetsLoading } = useAllAssetsQuery({
    variables: { filters: { type: config.assetType } },
    fetchPolicy: 'cache-and-network'
  });

  const debouncedSearchValue = useDebounce(filters.search, 200);

  type AssetMeta = {
    id: string;
    filename: string;
    originalname?: string;
    isStarred: boolean;
    tags: string[];
    usageRefs: { pageId?: string | null; blockId?: string | null }[];
  };

  const assetByUrl = useMemo(() => {
    const map: Record<string, AssetMeta> = {};
    (assetsData?.allAssets ?? []).forEach((asset) => {
      if (asset.url) map[asset.url] = asset as AssetMeta;
    });
    return map;
  }, [assetsData]);

  const galleryItems = useMemo((): GalleryItem[] => {
    return r2Files
      .filter((file): file is GalleryFile & { url: string } => Boolean(file.url))
      .filter((file) => !config.matchesFile || config.matchesFile(file.mimeType ?? '', file.filename ?? ''))
      .map((file) => {
        const asset = assetByUrl[file.url];
        return {
          id: asset?.id ?? file.path ?? file.filename,
          filename: asset?.filename ?? file.filename,
          originalname: asset?.originalname ?? undefined,
          url: file.url,
          isStarred: asset?.isStarred ?? false,
          tags: asset?.tags ?? [],
          usageRefs: asset?.usageRefs ?? [],
          createdAt: file.createdAt
        };
      });
  }, [r2Files, assetByUrl, config]);

  const filteredAndSortedItems = useMemo(
    () =>
      sortByDateAndName(
        galleryItems.filter(
          (item) =>
            matchesSearch(item, debouncedSearchValue, ['filename']) &&
            matchesFavoritesFilter(item, filters.favorites) &&
            matchesUsageFilter(item, filters.usage)
        )
      ),
    [galleryItems, debouncedSearchValue, filters.favorites, filters.usage]
  );

  const handleCardClick = (item: GalleryItem) => {
    onPick({
      kind: 'gallery',
      id: item.id,
      fileName: item.filename,
      src: item.url,
      locale: 'uk'
    });
  };

  const loading = r2Loading || assetsLoading;

  return (
    <Box data-testid="GalleryView" sx={sharedViewStyles.container}>
      <Box sx={sharedViewStyles.header}>
        <Typography variant="h6" sx={sharedViewStyles.title}>
          {config.title}
        </Typography>

        <Box sx={sharedViewStyles.controlsGroup}>
          <SearchButton
            value={filters.search}
            onSearch={(search) => onFiltersChange({ search })}
            placeholder="Пошук..."
            testId="GalleryView-search"
          />
          <FilterDropdown
            label="Позначення"
            value={filters.favorites}
            options={favoritesFilterOptions}
            onChange={(favorites) => onFiltersChange({ favorites })}
            testId="GalleryView-favoritesFilter"
          />
          <FilterDropdown
            label="Використання"
            value={filters.usage}
            options={usageFilterOptions}
            onChange={(usage) => onFiltersChange({ usage })}
            testId="GalleryView-usageFilter"
          />
        </Box>
      </Box>

      {loading ? (
        <Box sx={sharedViewStyles.gridContainer}>Завантаження...</Box>
      ) : (
        <MediaGrid
          items={filteredAndSortedItems}
          sx={sharedViewStyles.gridContainer}
          renderCard={(item) => (
            <GalleryCard
              src={item.url}
              iconSrc={config.iconSrc}
              fileName={item.originalname || item.filename}
              isStarred={item.isStarred}
              usageLocations={getPageNames(item.usageRefs)}
              onClick={() => handleCardClick(item)}
              testId={`GalleryCard-${item.id}`}
            />
          )}
          testIdPrefix="GalleryView"
        />
      )}
    </Box>
  );
}
