'use client';

import { Box, Typography } from '@mui/material';
import React from 'react';

import { ColumnsConfig } from './row-variants/Row.types';
import { styles } from './TableHeader.styles';

type HeaderRowProps = Readonly<{
  columns: readonly ColumnsConfig[];
  gridTemplate: string;
}>;

export function HeaderRow({ columns, gridTemplate }: HeaderRowProps) {
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
