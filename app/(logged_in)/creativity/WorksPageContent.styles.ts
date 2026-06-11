import { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { filterSelectStyles } from '~/shared/components/selector/FilterSelect.styles';
import { mainHexPalette as colors } from '~/shared/theme/colors';

export const TABLE_DIVIDER_COLOR = '#CDD4DE';
const HORIZONTAL_ROW_DIVIDER_COLOR = '#D9DCE866';
const NUMBER_COLUMN_WIDTH = '48px';
const GROUP_GENRE_COLUMN_WIDTH = '220px';
const GROUP_YEARS_COLUMN_WIDTH = '96px';
const STATUS_COLUMN_WIDTH = '310px';
const ACTIONS_COLUMN_WIDTH = '88px';

const SINGLE_LINE_ELLIPSIS = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
} satisfies SxProps<Theme>;

const WORK_ROW_GRID_SX = {
  display: 'grid',
  gridTemplateColumns: `1px minmax(220px, 1fr) ${GROUP_GENRE_COLUMN_WIDTH} ${GROUP_YEARS_COLUMN_WIDTH} ${STATUS_COLUMN_WIDTH} ${ACTIONS_COLUMN_WIDTH}`,
  alignItems: 'center',
  borderBottom: `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
  minWidth: 0
} satisfies SxProps<Theme>;

const META_TEXT_SX = {
  color: 'text.secondary',
  fontSize: '14px',
  minWidth: 0,
  ...SINGLE_LINE_ELLIPSIS
} satisfies SxProps<Theme>;

const TITLE_TEXT_SX = {
  fontSize: '15px',
  minWidth: 0,
  ...SINGLE_LINE_ELLIPSIS
} satisfies SxProps<Theme>;

const TABLE_HEADER_TEXT_SX = {
  fontSize: '16px',
  lineHeight: '22px',
  fontWeight: 700,
  color: '#63666E',
  fontStyle: 'normal',
  ...SINGLE_LINE_ELLIPSIS
} satisfies SxProps<Theme>;

const MENU_ITEM_BASE_SX = {
  ...filterSelectStyles.menuItem,
  minHeight: 'auto',
  px: '12px',
  py: '8px',
  borderRadius: '8px'
} satisfies SxProps<Theme>;

export const styles = {
  contextMenuWrapper: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  contentMenuButton: {
    color: '#190D03',
    width: '32px',
    height: '32px',
    p: 0,
    borderRadius: '50%',
    '&:hover': {
      bgcolor: 'rgba(25,13,3,0.08)'
    }
  },

  rowActionsCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  individualWorkRow: {
    ...WORK_ROW_GRID_SX,
    columnGap: '8px',
    py: '12px'
  },
  markerColumn: {
    width: '1px'
  },
  genreSpacer: {
    width: GROUP_GENRE_COLUMN_WIDTH
  },
  metaText: META_TEXT_SX,
  titleText: TITLE_TEXT_SX,
  workRowTitle: {
    fontSize: '14px',
    fontWeight: 500,
    minWidth: 0,
    flex: 1,
    ...SINGLE_LINE_ELLIPSIS
  },
  yearText: {
    ...META_TEXT_SX,
    fontWeight: 500,
    width: GROUP_YEARS_COLUMN_WIDTH,
    textAlign: 'left'
  },
  opusColumnDivider: {
    borderRight: `1px solid ${TABLE_DIVIDER_COLOR}`,
    pr: '10px'
  },
  tableHeaderText: TABLE_HEADER_TEXT_SX,
  menuList: {
    px: '8px',
    py: '4px'
  },
  editActionWrapper: (theme: Theme) => ({
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mr: theme.spacing(-1.5),
    flexShrink: 0
  }),
  editActionButton: {
    color: colors.black,
    width: '32px',
    height: '32px',
    p: 0,
    borderRadius: '50%',
    '& svg': { width: '18px', height: '18px' },
    '&:hover': {
      bgcolor: alpha(colors.black, 0.08)
    }
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: `1px calc(${NUMBER_COLUMN_WIDTH} + 26px) minmax(220px, 1fr) ${GROUP_GENRE_COLUMN_WIDTH} ${GROUP_YEARS_COLUMN_WIDTH} ${STATUS_COLUMN_WIDTH} ${ACTIONS_COLUMN_WIDTH}`,
    columnGap: '8px',
    alignItems: 'center',
    px: 0,
    py: '8px',
    borderBottom: `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
    minWidth: 0
  },
  accordion: {
    border: 'none',
    borderBottom: `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
    mb: '4px',
    overflow: 'hidden',
    '&:before': { display: 'none' },
    '&.Mui-expanded': { mb: '4px' }
  },
  accordionSummary: {
    px: 0,
    minHeight: '56px',
    flexDirection: 'row-reverse',
    borderBottom: `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
    '& .MuiAccordionSummary-expandIconWrapper': {
      width: '26px',
      height: '26px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ml: '6px',
      mr: 0,
      flexShrink: 0
    },
    '& .MuiAccordionSummary-content': {
      display: 'block',
      my: '12px',
      minWidth: 0,
      width: '100%'
    },
    '&.Mui-expanded .MuiAccordionSummary-expandIconWrapper': {
      transform: 'rotate(90deg)'
    }
  },
  accordionSummaryContent: {
    display: 'grid',
    gridTemplateColumns: `1px ${NUMBER_COLUMN_WIDTH} minmax(220px, 1fr) ${GROUP_GENRE_COLUMN_WIDTH} ${GROUP_YEARS_COLUMN_WIDTH} ${STATUS_COLUMN_WIDTH} ${ACTIONS_COLUMN_WIDTH}`,
    columnGap: '8px',
    alignItems: 'center',
    minWidth: 0
  },
  accordionSummaryContentSpacer: {
    width: '1px',
    alignSelf: 'stretch',
    backgroundColor: 'transparent'
  },
  accordionDetails: {
    pl: 0,
    pr: 0,
    pt: 0,
    pb: 0
  },
  createButton: {
    borderRadius: '20px',
    px: '24px',
    py: '8px',
    minHeight: '40px',
    textTransform: 'none',
    color: colors.black,
    boxShadow: 'none',
    fontSize: '16px',
    lineHeight: 1.5,
    bgcolor: colors.yellow[500],
    '&:hover': {
      bgcolor: colors.yellow[600],
      boxShadow: 'none'
    }
  },
  createMenuItem: {
    ...MENU_ITEM_BASE_SX,
    color: colors.black,
    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
    '&.Mui-focusVisible': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
  },
  pageContainer: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  opusNumberTypography: {
    fontWeight: 600,
    fontStyle: 'italic',
    fontSize: '14px',
    color: 'text.secondary',
    width: NUMBER_COLUMN_WIDTH,
    borderRight: `1px solid ${TABLE_DIVIDER_COLOR}`,
    pr: '10px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  contextMenuDropdown: {
    '& .MuiPaper-root': {
      width: '200px'
    }
  },
  statusSpacer: {
    width: STATUS_COLUMN_WIDTH
  },
  tableHeaderFirstText: {
    ...TABLE_HEADER_TEXT_SX,
    textAlign: 'left',
    justifySelf: 'start',
    width: '100%',
    pl: 0
  },
  actionsSpacer: {
    width: ACTIONS_COLUMN_WIDTH
  },
  groupTitleText: {
    ...TITLE_TEXT_SX,
    fontWeight: 600
  },
  groupGenreText: {
    ...META_TEXT_SX,
    fontWeight: 600,
    width: GROUP_GENRE_COLUMN_WIDTH
  },
  groupYearsText: {
    ...META_TEXT_SX,
    fontWeight: 600,
    width: GROUP_YEARS_COLUMN_WIDTH,
    textAlign: 'left'
  },
  statusColumnWrapper: {
    width: STATUS_COLUMN_WIDTH,
    minWidth: 0
  },
  individualWorkYearText: {
    ...META_TEXT_SX,
    width: GROUP_YEARS_COLUMN_WIDTH,
    textAlign: 'left'
  },
  createDropdownMenu: {
    '& .MuiPaper-root': {
      width: '170px'
    }
  },
  worksListContainer: {
    pt: '12px'
  }
} satisfies Record<string, SxProps<Theme>>;

export const getGroupedWorkRowSx = (isLast: boolean): SxProps<Theme> => ({
  display: 'grid',
  gridTemplateColumns: `1px minmax(220px, 1fr) ${GROUP_GENRE_COLUMN_WIDTH} ${GROUP_YEARS_COLUMN_WIDTH} ${STATUS_COLUMN_WIDTH} ${ACTIONS_COLUMN_WIDTH}`,
  alignItems: 'center',
  borderBottom: isLast ? 'none' : `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
  minWidth: 0,
  columnGap: '8px',
  py: '8px',
  px: 0
});

export const getContextMenuDropdownItem = (isDanger?: boolean): SxProps<Theme> => ({
  ...MENU_ITEM_BASE_SX,
  color: isDanger ? 'error.main' : colors.black,
  '&:hover': {
    bgcolor: isDanger ? 'rgba(211,47,47,0.04)' : 'rgba(0, 0, 0, 0.04)'
  }
});
