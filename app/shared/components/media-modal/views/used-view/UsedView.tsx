'use client';

import { Box } from '@mui/material';
import { useMemo } from 'react';

import { FilterDropdown } from '../../components/filter-dropdown/FilterDropdown';
import { MediaGrid } from '../../components/media-grid/MediaGrid';
import { SearchButton } from '../../components/search-button/SearchButton';
import { UsedCard } from '../../components/used-card/UsedCard';
import type { UsedFilters } from '../../flow/MediaModalFlowState';
import type { UsedMedia } from '../../MediaModal.types';
import { sharedViewStyles } from '../shared-view.styles';
import { useDebounce } from '~/hooks/use-debounce/useDebounce';
import { matchesSearch, sortByDateAndName } from '~/lib/utils/filterHelpers';

type Props = Readonly<{
  selected: UsedMedia | null;
  onPick: (selected: UsedMedia) => void;
  filters: UsedFilters;
  onFiltersChange: (filters: Partial<UsedFilters>) => void;
}>;

type MockUsedAsset = {
  _id: string;
  filename: string;
  url: string;
  locale: 'uk' | 'en';
  createdAt: string;
};

const mockUsedAssets: MockUsedAsset[] = [
  {
    _id: '1',
    filename: '2025-01-10-newest.jpg',
    url: '/images/mission-1.png',
    locale: 'uk',
    createdAt: '2025-01-10T10:00:00Z'
  },
  {
    _id: '2',
    filename: 'piano-studio.jpg',
    url: '/images/foundation-second.png',
    locale: 'en',
    createdAt: '2025-01-09T10:00:00Z'
  },
  {
    _id: '3',
    filename: 'composer-portrait.jpg',
    url: '/images/foundation-first.png',
    locale: 'uk',
    createdAt: '2025-01-08T10:00:00Z'
  },
  {
    _id: '4',
    filename: '2025-01-07-oldest.jpg',
    url: '/images/foundation-first.png',
    locale: 'en',
    createdAt: '2025-01-07T10:00:00Z'
  }
];

const languageFilterOptions = [
  { value: 'uk', label: 'Українська' },
  { value: 'en', label: 'English' }
];

export function UsedView({ onPick, filters, onFiltersChange }: Props) {
  const debouncedSearchValue = useDebounce(filters.search, 200);

  const handleCardClick = (asset: MockUsedAsset) => {
    const usedMedia: UsedMedia = {
      kind: 'used',
      id: asset._id,
      fileName: asset.filename,
      src: asset.url,
      locale: asset.locale
    };

    onPick(usedMedia);
  };

  const filteredAndSortedAssets = useMemo(
    () =>
      sortByDateAndName(
        mockUsedAssets.filter((asset) => {
          if (!matchesSearch(asset, debouncedSearchValue, ['filename'])) {
            return false;
          }

          if (filters.language && asset.locale !== filters.language) {
            return false;
          }

          return true;
        })
      ),
    [debouncedSearchValue, filters.language]
  );

  return (
    <Box data-testid="UsedView" sx={sharedViewStyles.container}>
      <Box sx={sharedViewStyles.header}>
        <Box sx={sharedViewStyles.title}>Зображення на сторінці</Box>

        <Box sx={sharedViewStyles.controlsGroup}>
          <SearchButton
            value={filters.search}
            onSearch={(search) => onFiltersChange({ search })}
            placeholder="Пошук..."
            testId="UsedView-search"
          />
          <FilterDropdown
            label="Мова"
            value={filters.language}
            options={languageFilterOptions}
            onChange={(language) => onFiltersChange({ language })}
            testId="UsedView-languageFilter"
          />
        </Box>
      </Box>

      <MediaGrid
        items={filteredAndSortedAssets}
        sx={sharedViewStyles.gridContainer}
        renderCard={(asset: MockUsedAsset) => (
          <UsedCard
            src={asset.url}
            fileName={asset.filename}
            locale={asset.locale}
            onClick={() => handleCardClick(asset)}
            testId={`UsedCard-${asset._id}`}
          />
        )}
        testIdPrefix="UsedView"
      />
    </Box>
  );
}
