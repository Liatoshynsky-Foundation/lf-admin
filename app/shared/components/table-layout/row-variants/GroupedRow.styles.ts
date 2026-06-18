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
    gridTemplateColumns: `1px ${gridTemplate} ${ACTIONS_COLUMN_WIDTH}`,
    columnGap: '8px',
    alignItems: 'stretch',
    minWidth: 0,
  }),

  groupedSubRow: (gridTemplate: string, isLast: boolean): SxProps<Theme> => ({
    display: 'grid',
    gridTemplateColumns: `1px ${gridTemplate} ${ACTIONS_COLUMN_WIDTH}`,
    alignItems: 'stretch',
    borderBottom: isLast ? 'none' : `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
    minWidth: 0,
    columnGap: '8px',
    py: '8px',
    px: 0,
    pl: '32px',
  }),

  actionsCellWithWidth: (customWidth?: string): SxProps<Theme> => ({
    ...styles.rowActionsCell,
    width: customWidth ?? ACTIONS_COLUMN_WIDTH,
  }),

  groupCell: (colId: string, hasRightDivider?: boolean): SxProps<Theme> => ({
    minWidth: 0,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    pr: hasRightDivider ? '10px' : 0,
    borderRight: hasRightDivider ? `1px solid ${TABLE_DIVIDER_COLOR}` : 'none',
    ...(colId === 'status' ? { justifyContent: 'center', width: '100%' } : { justifyContent: 'flex-start' }),
  }),

  groupCellText: (colId: string): SxProps<Theme> => ({
    ...(colId === 'title' ? styles.mainRowText : styles.metaText),
    width: '100%',
    ...(colId === 'status' ? { textAlign: 'center' } : { textAlign: 'left' }),
  }),

  subCell: (colId: string, hasRightDivider?: boolean, hasContent?: boolean): SxProps<Theme> => ({
    minWidth: 0,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    pr: hasRightDivider && hasContent ? '10px' : 0,
    borderRight: hasRightDivider && hasContent ? `1px solid ${TABLE_DIVIDER_COLOR}` : 'none',
    ...(colId === 'status' ? { justifyContent: 'center', width: '100%' } : { justifyContent: 'flex-start' }),
  }),

  subCellText: (colId: string): SxProps<Theme> => ({
    ...styles.subRowText,
    width: '100%',
    textAlign: colId === 'status' ? 'center' : 'left',
  }),

  accordion: {
    border: 'none',
    borderRadius: '0px !important',
    borderBottom: `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
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
      my: '12px',
      minWidth: 0,
      width: '100%',
    },
    '&.Mui-expanded': {
      borderBottom: `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
    },
    '&.Mui-expanded .MuiAccordionSummary-expandIconWrapper': {
      transform: 'rotate(90deg)',
    },
  },
};