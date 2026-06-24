import { SxProps, Theme } from '@mui/material';

import { alignToJustify, tableBorderWidth, tableDividerColor, tableGap, tableText } from '../TableLayout.styles';

export const styles = {
  individualWorkRow: (gridTemplate: string): SxProps<Theme> => ({
    display: 'grid',
    gridTemplateColumns: `${gridTemplate}`,
    columnGap: tableGap,
    alignItems: 'stretch',
    borderBottom: `${tableBorderWidth} solid`,
    borderBottomColor: tableDividerColor,
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
    borderRight: hasRightDivider ? `${tableBorderWidth} solid` : 'none',
    borderRightColor: hasRightDivider ? tableDividerColor : 'transparent',
    borderLeft: hasLeftDivider ? `${tableBorderWidth} solid` : 'none',
    borderLeftColor: hasLeftDivider ? tableDividerColor : 'transparent',
    gridColumn: `span ${hasSpan ? 2 : 1}`,
    justifyContent: align ?? alignToJustify[align],
  }),

  plainCellText: (align: 'left' | 'center' | 'right' = 'left'): SxProps<Theme> => ({
    ...tableText,
    width: '100%',
    textAlign: align,
  }),
};
