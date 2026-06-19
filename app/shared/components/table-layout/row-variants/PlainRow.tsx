import { Box, Typography } from '@mui/material';
import React from 'react';

import { ContextMenu } from '../components/ContextMenu';
import { EditAction } from '../components/EditAction';
import { HeaderConfig } from '../TableHeader';
import { styles } from './PlainRow.styles';
import { IndividualRowRenderer, RowActionConfig } from './Row.types';

type PlainRowProps<TPlain> = Readonly<{
  plainData: TPlain;
  columns: readonly HeaderConfig[];
  gridTemplate: string;
  renderer: IndividualRowRenderer<TPlain>;
  actions?: RowActionConfig;
}>;

export function PlainRow<TPlain>({ plainData, columns, gridTemplate, renderer, actions }: PlainRowProps<TPlain>) {
  return (
    <Box sx={styles.individualWorkRow(gridTemplate)}>
      {columns.map((col) => {
        if (col.id === 'opus' || col.id === 'group') return null;

        const content = renderer.renderPlainCell(col.id, plainData);

        return (
          <Box key={col.id} sx={styles.plainCell(col.id, col.hasRightDivider)}>
            {typeof content === 'string' ? (
              <Typography sx={styles.plainCellText(col.id)}>{content}</Typography>
            ) : (
              content
            )}
          </Box>
        );
      })}

      <Box sx={styles.rowActionsCell}>
        {actions ? (
          <>
            {actions.editHref && <EditAction href={actions.editHref} label={actions.editLabel ?? ''} />}
            <ContextMenu items={actions.menuItems} triggerLabel={actions.menuTriggerLabel} />
          </>
        ) : null}
      </Box>
    </Box>
  );
}
