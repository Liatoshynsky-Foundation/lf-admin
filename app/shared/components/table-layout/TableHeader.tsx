'use client';

import { Box, Typography } from '@mui/material';
import React from 'react';

import { ColumnDef } from './row-variants/Row.types';
import { styles } from './TableHeader.styles';

type HeaderRowProps<TGroup, TSub, TPlain> = Readonly<{
  columns: readonly ColumnDef<TGroup, TSub, TPlain>[];
  gridTemplate: string;
}>;
export function HeaderRow<TGroup, TSub, TPlain>({ columns, gridTemplate }: HeaderRowProps<TGroup, TSub, TPlain>) {
  return (
    <Box sx={styles.tableHeader(gridTemplate, columns[0]?.width ?? 'auto')}>
      {columns.map((col) => (
        <Typography key={col.id} className={col.id === 'status' ? 'status-header' : ''} sx={styles.headerTextCell()}>
          {col.headerLabel}
        </Typography>
      ))}

      <Box sx={styles.actionsSpacer} />
    </Box>
  );
}
