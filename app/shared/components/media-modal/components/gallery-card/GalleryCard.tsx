'use client';

import { Box } from '@mui/material';

import { MediaCard } from '../media-card/MediaCard';
import { styles } from './GalleryCard.styles';
import LinkIcon from '~/public/icons/link.svg';
import StarIcon from '~/public/icons/star.svg';
import TooltipCustom from '~/shared/components/design-system/tooltip/Tooltip';

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
    <Box sx={styles.iconsWrapper}>
      {isUsed && (
        <TooltipCustom
          title={
            <Box>
              <Box sx={styles.tooltipTitle}>Використовується на:</Box>
              {usageLocations.map((location) => (
                <Box key={location}>{location}</Box>
              ))}
            </Box>
          }
          showArrow={true}
        >
          <Box
            component="span"
            sx={styles.iconContainer}
          >
            <LinkIcon width={12} height={12} aria-hidden focusable={false} />
          </Box>
        </TooltipCustom>
      )}

      {isStarred && (
        <TooltipCustom title="В обраних" showArrow={true}>
          <Box
            component="span"
            sx={styles.iconContainer}
          >
            <StarIcon width={12} height={12} aria-hidden focusable={false} />
          </Box>
        </TooltipCustom>
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
