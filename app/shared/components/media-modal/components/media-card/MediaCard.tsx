'use client';

import { Box } from '@mui/material';
import { ReactNode } from 'react';

import { mediaCardStyles } from './MediaCard.styles';

type MediaCardProps = Readonly<{
  src: string;
  alt: string;
  onClick?: () => void;
  iconSrc?: string;
  topLeftContent?: ReactNode;
  topRightContent?: ReactNode;
  bottomContent?: ReactNode;
  testId?: string;
}>;

export function MediaCard({
  src,
  alt,
  onClick,
  iconSrc,
  topLeftContent,
  topRightContent,
  bottomContent,
  testId
}: MediaCardProps) {
  return (
    <Box sx={mediaCardStyles.wrapper} data-testid={testId}>
      <Box sx={mediaCardStyles.imageContainer} onClick={onClick}>
        {iconSrc ? (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box component="img" src={iconSrc} alt={alt} sx={{ width: 56, height: 56 }} />
          </Box>
        ) : (
          <Box component="img" src={src} alt={alt} loading="lazy" sx={mediaCardStyles.image} />
        )}

        {topLeftContent && <Box sx={mediaCardStyles.topLeft}>{topLeftContent}</Box>}

        {topRightContent && <Box sx={mediaCardStyles.topRight}>{topRightContent}</Box>}
      </Box>

      {bottomContent && <Box sx={mediaCardStyles.bottom}>{bottomContent}</Box>}
    </Box>
  );
}
