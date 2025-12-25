'use client';

import { Box, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

import { mediaGridStyles } from './MediaGrid.styles';
import { sxToArray } from '~/lib/utils/sxToArray';

type MediaGridProps<T> = {
  items: T[];
  renderCard: (item: T, index: number) => ReactNode;
  testIdPrefix?: string;
  sx?: SxProps<Theme>;
};

export function MediaGrid<T>({ items, renderCard, testIdPrefix = 'MediaGrid', sx }: MediaGridProps<T>) {
  return (
    <Box sx={[mediaGridStyles.container, ...sxToArray(sx)]} data-testid={testIdPrefix}>
      <Box sx={mediaGridStyles.grid}>
        {items.map((item, index) => (
          <Box key={index} data-testid={`${testIdPrefix}-item-${index}`}>
            {renderCard(item, index)}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
