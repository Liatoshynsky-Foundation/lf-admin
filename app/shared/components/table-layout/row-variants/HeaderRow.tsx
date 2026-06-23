'use client';

import { Box, Typography } from '@mui/material';
import React from 'react';

import { styles } from './HeaderRow.styles';
import { ColumnDef } from './Row.types';

type HeaderRowProps<TGroup, TSub, TPlain> = Readonly<{
  columns: readonly ColumnDef<TGroup, TSub, TPlain>[];
  gridTemplate: string;
}>;
export function HeaderRow<TGroup, TSub, TPlain>({ columns, gridTemplate }: HeaderRowProps<TGroup, TSub, TPlain>) {
  return (
    <Box sx={styles.tableHeader(gridTemplate, columns[0]?.width ?? 'auto')}>
      {columns.map((col) => (
        <Typography key={col.id} sx={styles.headerTextCell()}>
          {col.headerLabel}
        </Typography>
      ))}
    </Box>
  );
}
