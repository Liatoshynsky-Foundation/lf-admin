import { Box, Typography } from '@mui/material';
import React from 'react';

import { ContextMenu } from '../components/ContextMenu';
import { EditAction } from '../components/EditAction';
import { HeaderConfig } from '../TableHeader';
import { styles, TABLE_DIVIDER_COLOR } from '../TableLayout.styles';
import { IndividualRowRenderer, RowActionConfig } from './Row.types';

type PlainRowProps<TPlain> = Readonly<{
  plainData: TPlain;
  columns: readonly HeaderConfig[];
  gridTemplate: string;
  renderer: IndividualRowRenderer<TPlain>;
  actions?: RowActionConfig;
  renderPlainActions?: (plain: TPlain) => React.ReactNode;
}>;

export function PlainRow<TPlain>({
  plainData,
  columns,
  gridTemplate,
  renderer,
  actions,
  renderPlainActions
}: PlainRowProps<TPlain>) {
  return (
    <Box sx={styles.individualWorkRow(gridTemplate)}>
      <Box sx={styles.markerColumn} />

      {columns.map((col) => {
        if (col.id === 'opus' || col.id === 'group') return null;

        const content = renderer.renderPlainCell(col.id, plainData);

        const cellStyle = {
          minWidth: 0,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          pr: col.hasRightDivider ? '10px' : 0,
          borderRight: col.hasRightDivider ? `1px solid ${TABLE_DIVIDER_COLOR}` : 'none',
          ...(col.id === 'title' ? { gridColumn: 'span 2' } : {}),
          ...(col.id === 'status' ? { justifyContent: 'center', width: '100%' } : { justifyContent: 'flex-start' })
        };

        const textStyle = {
          ...(col.id === 'title' ? styles.mainRowText : styles.metaText),
          width: '100%',
          ...(col.id === 'status' ? { textAlign: 'center' } : { textAlign: 'left' })
        };

        return (
          <Box key={col.id} sx={cellStyle}>
            {typeof content === 'string' ? <Typography sx={textStyle}>{content}</Typography> : content}
          </Box>
        );
      })}

      <Box sx={{ ...styles.rowActionsCell }}>
        {renderPlainActions ? (
          renderPlainActions(plainData)
        ) : actions ? (
          <>
            {actions.editHref && <EditAction href={actions.editHref} label={actions.editLabel ?? ''} />}
            <ContextMenu items={actions.menuItems} triggerLabel={actions.menuTriggerLabel} />
          </>
        ) : null}
      </Box>
    </Box>
  );
}
