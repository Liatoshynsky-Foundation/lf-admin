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
  worksListContainer: {
    pt: '12px',
  },
  markerColumn: {
    width: '1px',
  },
  actionsSpacer: {
    width: ACTIONS_COLUMN_WIDTH,
  },
  rowActionsCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: ACTIONS_COLUMN_WIDTH,
    gap: '0px',
    flexShrink: 0,
  },

  gridRowBase: (gridTemplate: string): SxProps<Theme> => ({
    display: 'grid',
    gridTemplateColumns: `1px ${gridTemplate} ${ACTIONS_COLUMN_WIDTH}`,
    columnGap: '8px',
    alignItems: 'stretch',
    minWidth: 0,
  }),

  individualWorkRow: (gridTemplate: string): SxProps<Theme> => ({
    display: 'grid',
    gridTemplateColumns: `1px ${gridTemplate} ${ACTIONS_COLUMN_WIDTH}`,
    columnGap: '8px',
    alignItems: 'stretch',
    borderBottom: `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
    minWidth: 0,
    py: '12px',
  }),

  tableHeader: (gridTemplate: string, firstColWidth: string): SxProps<Theme> => {
    const restTemplates = gridTemplate.substring(gridTemplate.indexOf(' ') + 1);
    return {
      display: 'grid',
      gridTemplateColumns: `1px calc(${firstColWidth} + 26px) ${restTemplates} ${ACTIONS_COLUMN_WIDTH}`,
      columnGap: '8px',
      alignItems: 'center',
      py: '8px',
      borderBottom: `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
      minWidth: 0,
      '& .status-header': {
        overflow: 'visible',
        textOverflow: 'clip',
        whiteSpace: 'nowrap',
        width: 'auto',
        display: 'inline-block',
      }
    };
  },

  tableHeaderText: {
    fontSize: '16px',
    lineHeight: '22px',
    fontWeight: 700,
    color: '#63666E',
    fontStyle: 'normal',
    ...SINGLE_LINE_ELLIPSIS,
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

export const getGroupedWorkRowSx = (gridTemplate: string, isLast: boolean): SxProps<Theme> => ({
  display: 'grid',
  gridTemplateColumns: `1px ${gridTemplate} ${ACTIONS_COLUMN_WIDTH}`,
  alignItems: 'stretch',
  borderBottom: isLast ? 'none' : `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
  minWidth: 0,
  columnGap: '8px',
  py: '8px',
  px: 0,
});
