'use client';

import { Box } from '@mui/material';
import React from 'react';

import { GroupedRow } from './row-variants/GroupedRow';
import { PlainRow } from './row-variants/PlainRow';
import { BaseRowData, ColumnDef } from './row-variants/Row.types';
import { HeaderRow } from './TableHeader';

type TableLayoutProps<TGroup, TSub, TPlain> = Readonly<{
  data: readonly BaseRowData<TGroup, TSub, TPlain>[];
  columns: readonly ColumnDef<TGroup, TSub, TPlain>[];
}>;

export function TableLayout<TGroup, TSub, TPlain>({ data, columns }: TableLayoutProps<TGroup, TSub, TPlain>) {
  const gridTemplate = columns.map((c) => c.width).join(' ');

  return (
    <Box>
      <HeaderRow columns={columns} gridTemplate={gridTemplate} />

      {data.map((item) => {
        if (item.type === 'group') {
          return (
            <GroupedRow
              key={item.id}
              groupData={item.groupData}
              subRows={item.subRows}
              columns={columns}
              gridTemplate={gridTemplate}
              editAction={item.editAction}
              menuActions={item.menuActions}
              subRowActions={item.subRowActions}
              defaultExpanded
            />
          );
        }

        if (item.type === 'individual') {
          return (
            <PlainRow
              key={item.id}
              plainData={item.plainData}
              columns={columns}
              gridTemplate={gridTemplate}
              editAction={item.editAction}
              menuActions={item.menuActions}
            />
          );
        }

        return null;
      })}
    </Box>
  );
}
