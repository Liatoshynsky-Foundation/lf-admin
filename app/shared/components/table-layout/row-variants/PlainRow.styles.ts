import { SxProps, Theme } from '@mui/material';

import { ACTIONS_COLUMN_WIDTH, BORDER_WIDTH, HORIZONTAL_ROW_DIVIDER_COLOR, TABLE_GAP, TABLE_TEXT } from '../TableLayout.styles';

export const styles = {

  rowActionsCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: ACTIONS_COLUMN_WIDTH,
    gap: '0px',
    flexShrink: 0,
  },

  individualWorkRow: (gridTemplate: string): SxProps<Theme> => ({
    display: 'grid',
    gridTemplateColumns: `${gridTemplate} ${ACTIONS_COLUMN_WIDTH}`,
    columnGap: TABLE_GAP,
    alignItems: 'stretch',
    borderBottom: `${BORDER_WIDTH} solid`,
    borderBottomColor: HORIZONTAL_ROW_DIVIDER_COLOR,
    minWidth: 0,
    py: '20px',
  }),

  plainCell: (colId: string, hasRightDivider?: boolean, hasLeftDivider?: boolean): SxProps<Theme> => ({
    minWidth: 0,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    pr: hasRightDivider ? '10px' : 0,
    pl: hasLeftDivider ? '10px' : 0,
    borderRight: hasRightDivider  ? `${BORDER_WIDTH} solid` : 'none',
    borderRightColor: hasRightDivider  ? HORIZONTAL_ROW_DIVIDER_COLOR : 'transparent',
    borderLeft: hasLeftDivider ? `${BORDER_WIDTH} solid` : 'none',
    borderLeftColor: hasLeftDivider ? HORIZONTAL_ROW_DIVIDER_COLOR : 'transparent',
    ...(colId === 'title' ? { gridColumn: 'span 2' } : {}),
    ...(colId === 'status' ? { justifyContent: 'center', width: '100%' } : { justifyContent: 'flex-start' }),
  }),

  plainCellText: (colId: string): SxProps<Theme> => ({
    ...TABLE_TEXT,
    width: '100%',
    ...(colId === 'status' ? { textAlign: 'center' } : { textAlign: 'left' }),
  }),
};
