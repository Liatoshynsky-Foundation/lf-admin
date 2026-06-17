import { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { filterSelectStyles } from '~/shared/components/selector/FilterSelect.styles';
import { mainHexPalette as colors } from '~/shared/theme/colors';

export const TABLE_DIVIDER_COLOR = '#E6E7ED';
const HORIZONTAL_ROW_DIVIDER_COLOR = '#E6E7ED';
const ACTIONS_COLUMN_WIDTH = '80px';

const SINGLE_LINE_ELLIPSIS = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} satisfies SxProps<Theme>;

const MENU_ITEM_BASE_SX = {
  ...filterSelectStyles.menuItem,
  minHeight: 'auto',
  px: '12px',
  py: '8px',
  borderRadius: '8px',
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

  contextMenuWrapper: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contentMenuButton: {
    color: '#190D03',
    width: '40px',
    height: '40px',
    p: 0,
    borderRadius: '50%',
    '&:hover': {
      bgcolor: 'rgba(25,13,3,0.08)',
    },
  },
  editActionWrapper: () => ({
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mr: 0,
    flexShrink: 0,
  }),
  
  editActionButton: {
    color: colors.black,
    width: '40px',
    height: '40px',
    p: 0,
    borderRadius: '50%',
    '& svg': { 
      width: '20px', 
      height: '20px' 
    },
    '&:hover': {
      bgcolor: alpha(colors.black, 0.08),
    },
  },
  contextMenuDropdown: {
    '& .MuiPaper-root': {
      width: '200px',
    },
  },
  menuList: {
    px: '8px',
    py: '4px',
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

export const getContextMenuDropdownItem = (isDanger?: boolean): SxProps<Theme> => ({
  ...MENU_ITEM_BASE_SX,
  color: isDanger ? 'error.main' : colors.black,
  '&:hover': {
    bgcolor: isDanger ? 'rgba(211,47,47,0.04)' : 'rgba(0, 0, 0, 0.04)',
  },
});