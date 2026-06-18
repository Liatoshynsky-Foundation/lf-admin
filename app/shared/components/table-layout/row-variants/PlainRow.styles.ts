import { SxProps, Theme } from '@mui/material';

export const TABLE_DIVIDER_COLOR = '#E6E7ED';
const HORIZONTAL_ROW_DIVIDER_COLOR = '#E6E7ED';
const ACTIONS_COLUMN_WIDTH = '80px';

const SINGLE_LINE_ELLIPSIS = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} satisfies SxProps<Theme>;

export const styles = {
  markerColumn: {
    width: '1px',
  },
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
    gridTemplateColumns: `1px ${gridTemplate} ${ACTIONS_COLUMN_WIDTH}`,
    columnGap: '8px',
    alignItems: 'stretch',
    borderBottom: `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
    minWidth: 0,
    py: '12px',
  }),

  mainRowText: {
    fontSize: '15px',
    fontWeight: 600,
    ...SINGLE_LINE_ELLIPSIS,
  },
  metaText: {
    color: 'text.secondary',
    fontSize: '14px',
    ...SINGLE_LINE_ELLIPSIS,
  },

  plainCell: (colId: string, hasRightDivider?: boolean): SxProps<Theme> => ({
    minWidth: 0,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    pr: hasRightDivider ? '10px' : 0,
    borderRight: hasRightDivider ? `1px solid ${TABLE_DIVIDER_COLOR}` : 'none',
    ...(colId === 'title' ? { gridColumn: 'span 2' } : {}),
    ...(colId === 'status' ? { justifyContent: 'center', width: '100%' } : { justifyContent: 'flex-start' }),
  }),

  plainCellText: (colId: string): SxProps<Theme> => ({
    ...(colId === 'title' ? styles.mainRowText : styles.metaText),
    width: '100%',
    ...(colId === 'status' ? { textAlign: 'center' } : { textAlign: 'left' }),
  }),
};