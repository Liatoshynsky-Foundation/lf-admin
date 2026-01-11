'use client';

import { Box } from '@mui/material';
import { useMemo, useState } from 'react';

import { FilterDropdown } from '../../components/filter-dropdown/FilterDropdown';
import { GalleryCard } from '../../components/gallery-card/GalleryCard';
import { MediaGrid } from '../../components/media-grid/MediaGrid';
import { SearchButton } from '../../components/search-button/SearchButton';
import type { GalleryMedia } from '../../MediaModal.types';
import { sharedViewStyles } from '../shared-view.styles';
import { useDebounce } from '~/hooks/use-debounce/useDebounce';
import { matchesSearch, sortByDateAndName } from '~/lib/utils/filterHelpers';

type Props = Readonly<{
  selected: GalleryMedia | null;
  onPick: (selected: GalleryMedia) => void;
}>;

type MockAsset = {
  _id: string;
  filename: string;
  url: string;
  isStarred: boolean;
  tags: ('page' | 'news' | 'events' | 'opus')[];
  usageRefs: { pageId: string; blockId?: string }[];
  createdAt: string;
};

const mockAssets: MockAsset[] = [
  {
    _id: '1',
    filename: 'piano-studio.jpg',
    url: '/images/foundation-second.png',
    isStarred: true,
    tags: ['page', 'opus'],
    usageRefs: [
      { pageId: 'about', blockId: 'hero' },
      { pageId: 'collaboration', blockId: 'partners' }
    ],
    createdAt: '2025-01-08T10:30:00Z'
  },
  {
    _id: '2',
    filename: 'composer-portrait.jpg',
    url: '/images/foundation-first.png',
    isStarred: false,
    tags: ['opus'],
    usageRefs: [],
    createdAt: '2025-01-09T14:20:00Z'
  },
  {
    _id: '3',
    filename: 'archive-documents.jpg',
    url: '/images/mission-1.png',
    isStarred: true,
    tags: ['news', 'events'],
    usageRefs: [],
    createdAt: '2025-01-10T09:15:00Z'
  },
  {
    _id: '4',
    filename: 'concert-hall.jpg',
    url: '/images/foundation-first.png',
    isStarred: false,
    tags: ['events'],
    usageRefs: [],
    createdAt: '2025-01-07T16:45:00Z'
  }
];

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

const getPageNames = (usageRefs: MockAsset['usageRefs']): string[] => {
  const pageNameMap: Record<string, string> = {
    about: 'Про Фундацію',
    collaboration: 'Співпраця',
    news: 'Новини',
    events: 'Події'
  };

  return usageRefs.map((ref) => pageNameMap[ref.pageId] || ref.pageId);
};

const matchesFavoritesFilter = (asset: MockAsset, filter: string): boolean => {
  if (!filter) return true;
  if (filter === 'starred') return asset.isStarred;
  if (filter === 'not-starred') return !asset.isStarred;
  return true;
};

const matchesUsageFilter = (asset: MockAsset, filter: string): boolean => {
  if (!filter) return true;
  if (filter === 'unused') return asset.usageRefs.length === 0;
  return asset.tags.includes(filter as MockAsset['tags'][number]);
};

export function GalleryView({ selected: _selected, onPick }: Props) {
  const handleCardClick = (asset: MockAsset) => {
    const galleryMedia: GalleryMedia = {
      kind: 'gallery',
      id: asset._id,
      fileName: asset.filename,
      src: asset.url,
      locale: 'uk'
    };

    onPick(galleryMedia);
  };

  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 200);
  const [favoritesFilter, setFavoritesFilter] = useState('');
  const [usageFilter, setUsageFilter] = useState('');

  const filteredAndSortedAssets = useMemo(
    () =>
      sortByDateAndName(
        mockAssets.filter((asset) => {
          return (
            matchesSearch(asset, debouncedSearchValue, ['filename']) &&
            matchesFavoritesFilter(asset, favoritesFilter) &&
            matchesUsageFilter(asset, usageFilter)
          );
        })
      ),
    [debouncedSearchValue, favoritesFilter, usageFilter]
  );

  return (
    <Box data-testid="GalleryView" sx={sharedViewStyles.container}>
      <Box sx={sharedViewStyles.header}>
        <Box sx={sharedViewStyles.title}>Усі зображення</Box>

        <Box sx={sharedViewStyles.controlsGroup}>
          <SearchButton
            value={searchValue}
            onSearch={setSearchValue}
            placeholder="Пошук..."
            testId="GalleryView-search"
          />

          <FilterDropdown
            label="Позначення"
            value={favoritesFilter}
            options={favoritesFilterOptions}
            onChange={setFavoritesFilter}
            testId="GalleryView-favoritesFilter"
          />

          <FilterDropdown
            label="Використання"
            value={usageFilter}
            options={usageFilterOptions}
            onChange={setUsageFilter}
            testId="GalleryView-usageFilter"
          />
        </Box>
      </Box>

      <MediaGrid
        items={filteredAndSortedAssets}
        sx={sharedViewStyles.gridContainer}
        renderCard={(asset: MockAsset) => (
          <GalleryCard
            src={asset.url}
            fileName={asset.filename}
            isStarred={asset.isStarred}
            usageLocations={getPageNames(asset.usageRefs)}
            onClick={() => handleCardClick(asset)}
            testId={`GalleryCard-${asset._id}`}
          />
        )}
        testIdPrefix="GalleryView"
      />
    </Box>
  );
}
