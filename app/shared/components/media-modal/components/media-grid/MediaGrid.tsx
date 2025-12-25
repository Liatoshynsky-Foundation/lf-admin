'use client';

import { Box, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

import { mediaGridStyles } from './MediaGrid.styles';
import { sxToArray } from '~/lib/utils/sxToArray';

type MediaGridProps<T extends { _id?: string; id?: string }> = Readonly<{
  items: T[];
  renderCard: (item: T, index: number) => ReactNode;
  testIdPrefix?: string;
  sx?: SxProps<Theme>;
}>;

export function MediaGrid<T extends { _id?: string; id?: string }>({
  items,
  renderCard,
  testIdPrefix = 'MediaGrid',
  sx
}: MediaGridProps<T>) {
  return (
    <Box sx={[mediaGridStyles.container, ...sxToArray(sx)]} data-testid={testIdPrefix}>
      <Box sx={mediaGridStyles.grid}>
        {items.map((item, index) => {
          const key = item._id || item.id || `item-${index}`;
          return (
            <Box key={key} data-testid={`${testIdPrefix}-item-${index}`}>
              {renderCard(item, index)}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
