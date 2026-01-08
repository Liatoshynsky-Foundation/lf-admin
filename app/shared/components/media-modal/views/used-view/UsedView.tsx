'use client';

import { Box } from '@mui/material';

import { MediaGrid } from '../../components/media-grid/MediaGrid';
import { UsedCard } from '../../components/used-card/UsedCard';
import type { UsedMedia } from '../../MediaModal.types';
import { usedViewStyles } from './UsedView.styles';

type Props = Readonly<{
  selected: UsedMedia | null;
  onPick: (selected: UsedMedia) => void;
}>;

type MockUsedAsset = {
  _id: string;
  filename: string;
  url: string;
  locale: 'uk' | 'en';
};

const mockUsedAssets: MockUsedAsset[] = [
  {
    _id: '1',
    filename: 'piano-studio.jpg',
    url: '/images/mission-1.png',
    locale: 'uk'
  },
  {
    _id: '2',
    filename: 'piano-studio.jpg',
    url: '/images/foundation-second.png',
    locale: 'en'
  },
  {
    _id: '3',
    filename: 'composer-portrait.jpg',
    url: '/images/foundation-first.png',
    locale: 'uk'
  },
  {
    _id: '4',
    filename: 'composer-portrait.jpg',
    url: '/images/foundation-first.png',
    locale: 'en'
  }
];

export function UsedView({ onPick }: Props) {
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

  return (
    <Box data-testid="UsedView" sx={usedViewStyles.container}>
      <Box sx={usedViewStyles.header}>
        <Box sx={usedViewStyles.title}>Зображення на сторінці</Box>

        <Box sx={usedViewStyles.controlsGroup}></Box>
      </Box>

      <MediaGrid
        items={mockUsedAssets}
        sx={usedViewStyles.gridContainer}
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
