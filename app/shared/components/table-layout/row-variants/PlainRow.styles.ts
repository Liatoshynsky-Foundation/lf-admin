import { SxProps, Theme } from '@mui/material';

import { BORDER, TABLE_GAP, TABLE_TEXT } from '../TableLayout.styles';

const ACTIONS_COLUMN_WIDTH = '80px';


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
    borderBottom: BORDER,
    minWidth: 0,
    py: '20px',
  }),

  plainCell: (colId: string, hasRightDivider?: boolean, hasBorderLeft?: boolean): SxProps<Theme> => ({
    minWidth: 0,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    pr: hasRightDivider ? '10px' : 0,
    pl: hasBorderLeft ? '10px' : 0,
    borderRight: hasRightDivider ? BORDER : 'none',
    borderLeft: hasBorderLeft ? BORDER : 'none',
    ...(colId === 'title' ? { gridColumn: 'span 2' } : {}),
    ...(colId === 'status' ? { justifyContent: 'center', width: '100%' } : { justifyContent: 'flex-start' }),
  }),

  plainCellText: (colId: string): SxProps<Theme> => ({
    ...TABLE_TEXT,
    width: '100%',
    ...(colId === 'status' ? { textAlign: 'center' } : { textAlign: 'left' }),
  }),
};