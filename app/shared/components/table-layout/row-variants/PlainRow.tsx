'use client';

import { Box, Typography } from '@mui/material';
import React from 'react';

import { ContextMenu } from '../components/ContextMenu';
import { EditAction } from '../components/EditAction';
import { styles } from './PlainRow.styles';
import { ColumnDef, MenuItem } from './Row.types';

type PlainRowProps<TGroup, TSub, TPlain> = Readonly<{
  plainData: TPlain;
  columns: readonly ColumnDef<TGroup, TSub, TPlain>[];
  gridTemplate: string;
  editAction?: { editHref: string; editLabel: string };
  menuActions?: { menuItems: readonly MenuItem[]; menuTriggerLabel: string };
}>;

export function PlainRow<TGroup, TSub, TPlain>({
  plainData,
  columns,
  gridTemplate,
  editAction,
  menuActions
}: PlainRowProps<TGroup, TSub, TPlain>) {
  return (
    <Box sx={styles.individualWorkRow(gridTemplate)}>
      {columns.map((col) => {
        if (!col.renderPlain) return null;

        const content = col.renderPlain ? col.renderPlain(plainData) : null;

        return (
          <Box key={col.id} sx={styles.plainCell(col.id, col.hasRightDivider, col.hasLeftDivider)}>
            {typeof content === 'string' ? (
              <Typography sx={styles.plainCellText(col.id)}>{content}</Typography>
            ) : (
              content
            )}
          </Box>
        );
      })}

      <Box sx={styles.rowActionsCell}>
        {editAction && <EditAction href={editAction.editHref} label={editAction.editLabel} />}
        {menuActions && <ContextMenu items={menuActions.menuItems} triggerLabel={menuActions.menuTriggerLabel} />}
      </Box>
    </Box>
  );
}
