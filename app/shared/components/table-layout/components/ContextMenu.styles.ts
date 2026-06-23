import { SxProps, Theme } from '@mui/material';

import { HORIZONTAL_ROW_DIVIDER_COLOR } from '../TableLayout.styles';
import { filterSelectStyles } from '~/shared/components/selector/FilterSelect.styles';

const MENU_ITEM_BASE_SX = {
  ...filterSelectStyles.menuItem,
  minHeight: 'auto',
  px: '16px',
  py: '10px',
  borderRadius: '8px',
} satisfies SxProps<Theme>;

export const styles = {
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
  contextMenuDropdown: {
    '& .MuiPaper-root': {
      width: 'hug-content',
    },
  },
  menuItem: {
    ...MENU_ITEM_BASE_SX,
  },
  divider: {
    height: '1px',
    backgroundColor: HORIZONTAL_ROW_DIVIDER_COLOR,
    my: '8px',
  },
};

export const getContextMenuDropdownItem = (isDanger?: boolean): SxProps<Theme> => ({
  ...MENU_ITEM_BASE_SX,
  '&:hover': {
    bgcolor: isDanger ? 'rgba(211,47,47,0.04)' : 'rgba(0, 0, 0, 0.04)',
  },
});
