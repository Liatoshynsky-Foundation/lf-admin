import { SxProps, Theme } from '@mui/material';

import { alignToJustify, BORDER_WIDTH, HORIZONTAL_ROW_DIVIDER_COLOR, TABLE_GAP, TABLE_TEXT } from '../TableLayout.styles';

export const styles = {
  individualWorkRow: (gridTemplate: string): SxProps<Theme> => ({
    display: 'grid',
    gridTemplateColumns: `${gridTemplate}`,
    columnGap: TABLE_GAP,
    alignItems: 'stretch',
    borderBottom: `${BORDER_WIDTH} solid`,
    borderBottomColor: HORIZONTAL_ROW_DIVIDER_COLOR,
    minWidth: 0,
    py: '20px',
  }),

  plainCell: (
    hasRightDivider?: boolean, 
    hasLeftDivider?: boolean,
    align: 'left' | 'center' | 'right' = 'left',
    hasSpan?: boolean
  ): SxProps<Theme> => ({
    minWidth: 0,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    pr: hasRightDivider ? '10px' : 0,
    pl: hasLeftDivider ? '10px' : 0,
    borderRight: hasRightDivider ? `${BORDER_WIDTH} solid` : 'none',
    borderRightColor: hasRightDivider ? HORIZONTAL_ROW_DIVIDER_COLOR : 'transparent',
    borderLeft: hasLeftDivider ? `${BORDER_WIDTH} solid` : 'none',
    borderLeftColor: hasLeftDivider ? HORIZONTAL_ROW_DIVIDER_COLOR : 'transparent',
    gridColumn: `span ${hasSpan ? 2 : 1}`,
    justifyContent: align ?? alignToJustify[align],
  }),

  plainCellText: (align: 'left' | 'center' | 'right' = 'left'): SxProps<Theme> => ({
    ...TABLE_TEXT,
    width: '100%',
    textAlign: align,
  }),
};
