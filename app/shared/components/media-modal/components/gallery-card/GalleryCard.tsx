'use client';

import { Box, Tooltip } from '@mui/material';

import { MediaCard } from '../media-card/MediaCard';
import { galleryCardStyles } from './GalleryCard.styles';
import LinkIcon from '~/public/icons/link.svg';
import StarIcon from '~/public/icons/star.svg';

type GalleryCardProps = Readonly<{
  src: string;
  fileName: string;
  isStarred: boolean;
  usageLocations?: string[];
  onClick: () => void;
  testId?: string;
}>;

export function GalleryCard({ src, fileName, isStarred, usageLocations = [], onClick, testId }: GalleryCardProps) {
  const isUsed = usageLocations.length > 0;

  const topRightContent = (isUsed || isStarred) && (
    <Box sx={galleryCardStyles.iconsWrapper}>
      {isUsed && (
        <Tooltip
          title={
            <Box>
              <Box sx={{ fontWeight: 600, marginBottom: '4px' }}>Використовується на:</Box>
              {usageLocations.map((location) => (
                <Box key={location}>{location}</Box>
              ))}
            </Box>
          }
          arrow
          placement="top"
          slotProps={{ tooltip: galleryCardStyles.tooltip }}
        >
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LinkIcon width={12} height={12} aria-hidden focusable={false} />
          </Box>
        </Tooltip>
      )}

      {isStarred && (
        <Tooltip title="В обраних" arrow placement="top" slotProps={{ tooltip: galleryCardStyles.tooltip }}>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <StarIcon width={12} height={12} aria-hidden focusable={false} />
          </Box>
        </Tooltip>
      )}
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
