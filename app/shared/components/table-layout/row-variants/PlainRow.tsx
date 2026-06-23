'use client';

import { Box, Typography } from '@mui/material';
import React from 'react';

import { styles } from './PlainRow.styles';
import { ColumnDef } from './Row.types';

type PlainRowProps<TGroup, TSub, TPlain> = Readonly<{
  plainData: TPlain;
  columns: readonly ColumnDef<TGroup, TSub, TPlain>[];
  gridTemplate: string;
}>;

export function PlainRow<TGroup, TSub, TPlain>({
  plainData,
  columns,
  gridTemplate
}: PlainRowProps<TGroup, TSub, TPlain>) {
  const withGroups = columns.some((col) => col.renderGroup || col.renderSub);

  return (
    <Box sx={styles.individualWorkRow(gridTemplate)}>
      {columns.map((col) => {
        if (!col.renderPlain) return null;

        const content = col.renderPlain(plainData);
        const hasSpan = withGroups && col.id === 'title';

        return (
          <Box key={col.id} sx={styles.plainCell(col.hasRightDivider, col.hasLeftDivider, col.align, hasSpan)}>
            {typeof content === 'string' ? (
              <Typography sx={styles.plainCellText(col.align)}>{content}</Typography>
            ) : (
              content
            )}
          </Box>
        );
      })}
    </Box>
  );
}
