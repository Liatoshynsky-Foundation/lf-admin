'use client';

import { Box, Typography } from '@mui/material';
import React from 'react';

import { styles } from './TableHeader.styles';

export type HeaderConfig = {
  id: string;
  headerLabel: string;
  width: string;
  hasRightDivider?: boolean;
  align?: 'left' | 'center' | 'right';
};

type HeaderRowProps = Readonly<{
  columns: readonly HeaderConfig[];
  gridTemplate: string;
  actionsColumnWidth?: string;
}>;

export function HeaderRow({ columns, gridTemplate }: HeaderRowProps) {
  return (
    <Box sx={styles.tableHeader(gridTemplate, columns[0]?.width ?? 'auto')}>
      <Box sx={styles.markerColumn} />

      {columns.map((col) => (
        <Typography
          key={col.id}
          className={col.id === 'status' ? 'status-header' : ''}
          sx={styles.headerTextCell(col.id, col.align)}
        >
          {col.headerLabel}
        </Typography>
      ))}

      <Box sx={styles.actionsSpacer} />
    </Box>
  );
}
