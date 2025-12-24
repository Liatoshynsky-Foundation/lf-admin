'use client';

import { Box, Typography } from '@mui/material';

import { SvgImage } from '../svg-image/SvgImage';
import { imageCardStyles } from './ImageCard.styles';
import { ImageCardProps } from './types';

export const ImageCard = ({ image, isSelected, isCurrentlyUsed, onClick }: ImageCardProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <Box sx={imageCardStyles.container(isSelected, isCurrentlyUsed)} onClick={handleClick}>
      <Box component="img" src={image.src} alt={image.alt || image.name} sx={imageCardStyles.image} />

      {image.languageVersion && (
        <Box sx={imageCardStyles.badge}>
          <Typography sx={{ fontWeight: 600, fontSize: '12px', lineHeight: 1 }}>
            {image.languageVersion.toUpperCase()}
          </Typography>
        </Box>
      )}

      {isCurrentlyUsed && (
        <Box sx={imageCardStyles.usedCheckmark}>
          <Box
            sx={{
              filter:
                'brightness(0) saturate(100%) invert(74%) sepia(6%) saturate(264%) hue-rotate(205deg) brightness(92%) contrast(88%)'
            }}
          >
            <SvgImage src="/icons/chosen.svg" width={16} height={16} alt="used" />
          </Box>
        </Box>
      )}
    </Box>
  );
};
