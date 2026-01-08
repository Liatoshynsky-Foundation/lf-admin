'use client';

import { Box } from '@mui/material';

import { MediaCard } from '../media-card/MediaCard';
import { usedCardStyles } from './UsedCard.styles';

type UsedCardProps = Readonly<{
  src: string;
  fileName: string;
  locale: 'uk' | 'en';
  onClick: () => void;
  testId?: string;
}>;

export function UsedCard({ src, fileName, locale, onClick, testId = 'UsedCard' }: UsedCardProps) {
  const localeLabel = locale === 'uk' ? 'UA' : 'EN';

  const topRightContent = (
    <Box sx={usedCardStyles.badge}>
      <Box component="span" sx={usedCardStyles.badgeText}>
        {localeLabel}
      </Box>
    </Box>
  );

  return (
    <MediaCard
      src={src}
      alt={fileName}
      onClick={onClick}
      topRightContent={topRightContent}
      bottomContent={fileName}
      testId={testId}
    />
  );
}
