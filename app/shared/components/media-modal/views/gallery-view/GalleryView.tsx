'use client';

import { Box } from '@mui/material';
import { useState } from 'react';

import { FilterButton } from '../../components/filter-button/FilterButton';
import { GalleryCard } from '../../components/media-card/GalleryCard';
import { MediaGrid } from '../../components/media-grid/MediaGrid';
import { SearchButton } from '../../components/search-button/SearchButton';
import type { GalleryMedia } from '../../MediaModal.types';
import { galleryViewStyles } from './GalleryView.styles';

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
    ]
  },
  {
    _id: '2',
    filename: 'composer-portrait.jpg',
    url: '/images/foundation-first.png',
    isStarred: false,
    tags: ['opus'],
    usageRefs: []
  },
  {
    _id: '3',
    filename: 'archive-documents.jpg',
    url: '/images/mission-1.png',
    isStarred: true,
    tags: ['news', 'events'],
    usageRefs: []
  },
  {
    _id: '4',
    filename: 'concert-hall.jpg',
    url: '/images/foundation-first.png',
    isStarred: false,
    tags: ['events'],
    usageRefs: []
  }
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

  return (
    <Box data-testid="GalleryView" sx={galleryViewStyles.container}>
      <Box sx={galleryViewStyles.header}>
        <Box sx={galleryViewStyles.title}>Усі зображення</Box>

        <Box sx={galleryViewStyles.controlsGroup}>
          <SearchButton
            value={searchValue}
            onSearch={setSearchValue}
            placeholder="Пошук..."
            testId="GalleryView-search"
          />

          <FilterButton label="Позначення" onClick={() => {}} testId="GalleryView-filterFavorites" />

          <FilterButton label="Використання" onClick={() => {}} testId="GalleryView-filterUsage" />
        </Box>
      </Box>

      <MediaGrid
        items={mockAssets}
        sx={galleryViewStyles.gridContainer}
        renderCard={(asset) => (
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
