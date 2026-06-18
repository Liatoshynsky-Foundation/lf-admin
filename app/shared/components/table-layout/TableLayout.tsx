'use client';

import { Box } from '@mui/material';
import React from 'react';

import { GroupedRow } from './row-variants/GroupedRow';
import { PlainRow } from './row-variants/PlainRow';
import { BaseRowData } from './row-variants/Row.types';
import { HeaderConfig, HeaderRow } from './TableHeader';

type TableLayoutProps<TGroup, TSub, TPlain> = Readonly<{
  data: readonly BaseRowData<TGroup, TSub, TPlain>[];
  columns: readonly HeaderConfig[];
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
              renderer={item.renderer}
              actions={item.actions}
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
              renderer={item.renderer}
              actions={item.actions}
            />
          );
        }

        return null;
      })}
    </Box>
  );
}
