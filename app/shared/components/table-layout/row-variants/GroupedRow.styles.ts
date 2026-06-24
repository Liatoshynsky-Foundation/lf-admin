import { SxProps, Theme } from '@mui/material';

import { alignToJustify,  singleLineEllipsis, tableBorderWidth, tableDividerColor, tableGap, tableText, twoLineEllipsis } from '../TableLayout.styles';

export const styles = {
  accordionDetails: {
    p: 0,
  },
  emptySubCell: {
    height: '100%',
    borderRight: 'none',
  },

  mainRowText: {
    fontSize: '15px',
    fontWeight: 600,
    ...singleLineEllipsis,
  },
  subRowText: {
    fontSize: '14px',
    fontWeight: 500,
    ...singleLineEllipsis,
  },
  metaText: {
    color: 'text.secondary',
    fontSize: '14px',
    ...singleLineEllipsis,
  },

  gridRowBase: (gridTemplate: string): SxProps<Theme> => ({
    display: 'grid',
    gridTemplateColumns: `${gridTemplate}`,
    columnGap: tableGap,
    alignItems: 'stretch',
    minWidth: 0,
  }),

  groupedSubRow: (gridTemplate: string, isLast: boolean): SxProps<Theme> => ({
    display: 'grid',
    gridTemplateColumns: `${gridTemplate} `,
    alignItems: 'stretch',
    borderBottom: isLast ? 'none' : `${tableBorderWidth} solid`,
    borderBottomColor: tableDividerColor,
    minWidth: 0,
    columnGap: tableGap,
    py: '12px',
    px: 0,
    pl: '32px',
  }),

  groupCell: (
    hasRightDivider?: boolean, 
    hasLeftDivider?: boolean, 
    align: 'left' | 'center' | 'right' = 'left'
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
    justifyContent: alignToJustify[align], 
  }),

  groupCellText: (colId: string): SxProps<Theme> => ({
    ...tableText,
    ...twoLineEllipsis,
    width: '100%',
    ...(colId === 'status' ? { textAlign: 'center' } : { textAlign: 'left' }),
  }),

  subCell: (
    hasRightDivider?: boolean, 
    hasLeftDivider?: boolean, 
    hasContent?: boolean,
    align: 'left' | 'center' | 'right' = 'left'
  ): SxProps<Theme> => ({
    minWidth: 0,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    pr: hasRightDivider && hasContent ? '10px' : 0,
    pl: hasLeftDivider && hasContent ? '10px' : 0,
    borderRight: hasRightDivider && hasContent ? `${tableBorderWidth} solid` : 'none',
    borderRightColor: hasRightDivider && hasContent ? tableDividerColor : 'transparent',
    borderLeft: hasLeftDivider && hasContent ? `${tableBorderWidth} solid` : 'none',
    borderLeftColor: hasLeftDivider && hasContent ? tableDividerColor : 'transparent',
    
    justifyContent: alignToJustify[align],
  }),

  subCellText: (colId: string): SxProps<Theme> => ({
    ...tableText,
    ...twoLineEllipsis,
    width: '100%',
    textAlign: colId === 'status' ? 'center' : 'left',
  }),

  accordion: {
    border: 'none',
    borderRadius: '0px !important',
    borderBottom: `${tableBorderWidth} solid`,
    borderBottomColor: tableDividerColor,
    backgroundColor: 'transparent',
    boxShadow: 'none',
    overflow: 'hidden',
    '&:before': { display: 'none' },
  },
  accordionSummary: {
    px: 0,
    border: 'none',
    boxShadow: 'none',
    minHeight: '56px',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper': {
      width: '26px',
      height: '26px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ml: '6px',
      mr: 0,
      flexShrink: 0,
    },
    '& .MuiAccordionSummary-content': {
      display: 'block',
      my: '20px',
      minWidth: 0,
      width: '100%',
    },
    '&.Mui-expanded': {
      borderBottom: `${tableBorderWidth} solid`,
      borderBottomColor: tableDividerColor,
    },
    '&.Mui-expanded .MuiAccordionSummary-expandIconWrapper': {
      transform: 'rotate(90deg)',
    },
  },
};
