import { Box, Typography } from '@mui/material';
import React from 'react';

import { styles } from './HeaderRow.styles';
import { ColumnDef } from './Row.types';

type HeaderRowProps<TGroup, TSub, TPlain> = Readonly<{
  columns: readonly ColumnDef<TGroup, TSub, TPlain>[];
  gridTemplate: string;
  includeExpandGutter?: boolean;
}>;

export function HeaderRow<TGroup, TSub, TPlain>({
  columns,
  gridTemplate,
  includeExpandGutter = false
}: HeaderRowProps<TGroup, TSub, TPlain>) {
  return (
    <Box sx={styles.tableHeader(gridTemplate, columns[0]?.width ?? 'auto', includeExpandGutter)}>
      {columns.map((col) => (
        <Typography key={col.id} sx={styles.headerTextCell()}>
          {col.headerLabel}
        </Typography>
      ))}
    </Box>
  );
}
