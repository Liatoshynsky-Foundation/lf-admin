import { SxProps, Theme } from '@mui/material';

import { ACTIONS_COLUMN_WIDTH,  BORDER_WIDTH, HORIZONTAL_ROW_DIVIDER_COLOR, SINGLE_LINE_ELLIPSIS, TABLE_GAP, TABLE_TEXT, TWO_LINE_ELLIPSIS } from '../TableLayout.styles';

export const styles = {
  rowActionsCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: ACTIONS_COLUMN_WIDTH,
    gap: '0px',
    flexShrink: 0,
  },
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
    ...SINGLE_LINE_ELLIPSIS,
  },
  subRowText: {
    fontSize: '14px',
    fontWeight: 500,
    ...SINGLE_LINE_ELLIPSIS,
  },
  metaText: {
    color: 'text.secondary',
    fontSize: '14px',
    ...SINGLE_LINE_ELLIPSIS,
  },

  gridRowBase: (gridTemplate: string): SxProps<Theme> => ({
    display: 'grid',
    gridTemplateColumns: `${gridTemplate} ${ACTIONS_COLUMN_WIDTH}`,
    columnGap: TABLE_GAP,
    alignItems: 'stretch',
    minWidth: 0,
  }),

  groupedSubRow: (gridTemplate: string, isLast: boolean): SxProps<Theme> => ({
    display: 'grid',
    gridTemplateColumns: `${gridTemplate} ${ACTIONS_COLUMN_WIDTH}`,
    alignItems: 'stretch',
    borderBottom: isLast ? 'none' : `${BORDER_WIDTH} solid`,
    borderBottomColor: HORIZONTAL_ROW_DIVIDER_COLOR,
    minWidth: 0,
    columnGap: TABLE_GAP,
    py: '12px',
    px: 0,
    pl: '32px',
  }),

  actionsCellWithWidth: (customWidth?: string): SxProps<Theme> => ({
    ...styles.rowActionsCell,
    width: customWidth ?? ACTIONS_COLUMN_WIDTH,
  }),

  groupCell: (colId: string, hasRightDivider?: boolean, hasLeftDivider?: boolean): SxProps<Theme> => ({
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
    ...(colId === 'status' ? { justifyContent: 'center', width: '100%' } : { justifyContent: 'flex-start' }),
  }),

  groupCellText: (colId: string): SxProps<Theme> => ({
    ...TABLE_TEXT,
    ...TWO_LINE_ELLIPSIS,
    width: '100%',
    ...(colId === 'status' ? { textAlign: 'center' } : { textAlign: 'left' }),
  }),

  subCell: (colId: string, hasRightDivider?: boolean, hasLeftDivider?: boolean, hasContent?: boolean): SxProps<Theme> => ({
    minWidth: 0,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    pr: hasRightDivider && hasContent ? '10px' : 0,
    pl: hasLeftDivider && hasContent ? '10px' : 0,
    borderRight: hasRightDivider && hasContent ? `${BORDER_WIDTH} solid` : 'none',
    borderRightColor: hasRightDivider && hasContent ? HORIZONTAL_ROW_DIVIDER_COLOR : 'transparent',
    borderLeft: hasLeftDivider && hasContent ? `${BORDER_WIDTH} solid` : 'none',
    borderLeftColor: hasLeftDivider && hasContent ? HORIZONTAL_ROW_DIVIDER_COLOR : 'transparent',
    ...(colId === 'status' ? { justifyContent: 'center', width: '100%' } : { justifyContent: 'flex-start' }),
  }),

  subCellText: (colId: string): SxProps<Theme> => ({
    ...TABLE_TEXT,
    ...TWO_LINE_ELLIPSIS,
    width: '100%',
    textAlign: colId === 'status' ? 'center' : 'left',
  }),

  accordion: {
    border: 'none',
    borderRadius: '0px !important',
    borderBottom: `${BORDER_WIDTH} solid`,
    borderBottomColor: HORIZONTAL_ROW_DIVIDER_COLOR,
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
      borderBottom: `${BORDER_WIDTH} solid`,
      borderBottomColor: HORIZONTAL_ROW_DIVIDER_COLOR,
    },
    '&.Mui-expanded .MuiAccordionSummary-expandIconWrapper': {
      transform: 'rotate(90deg)',
    },
  },
};
