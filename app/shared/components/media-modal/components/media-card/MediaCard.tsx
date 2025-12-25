'use client';

import { Box } from '@mui/material';
import { ReactNode } from 'react';

import { mediaCardStyles } from './MediaCard.styles';

type MediaCardProps = Readonly<{
  src: string;
  alt: string;
  onClick?: () => void;
  topLeftContent?: ReactNode;
  topRightContent?: ReactNode;
  bottomContent?: ReactNode;
  testId?: string;
}>;

export function MediaCard({
  src,
  alt,
  onClick,
  topLeftContent,
  topRightContent,
  bottomContent,
  testId
}: MediaCardProps) {
  return (
    <Box sx={mediaCardStyles.wrapper} data-testid={testId}>
      <Box sx={mediaCardStyles.imageContainer} onClick={onClick}>
        <Box component="img" src={src} alt={alt} loading="lazy" sx={mediaCardStyles.image} />

        {topLeftContent && <Box sx={mediaCardStyles.topLeft}>{topLeftContent}</Box>}

        {topRightContent && <Box sx={mediaCardStyles.topRight}>{topRightContent}</Box>}
      </Box>

      {bottomContent && <Box sx={mediaCardStyles.bottom}>{bottomContent}</Box>}
    </Box>
  );
}
