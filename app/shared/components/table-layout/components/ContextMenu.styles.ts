import { SxProps, Theme } from '@mui/material';

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
      width: '200px',
    },
  },
  menuItem: {
    ...MENU_ITEM_BASE_SX,
  }
};

export const getContextMenuDropdownItem = (isDanger?: boolean): SxProps<Theme> => ({
  ...MENU_ITEM_BASE_SX,
  color: isDanger ? 'error.main' : 'colors.black',
  '&:hover': {
    bgcolor: isDanger ? 'rgba(211,47,47,0.04)' : 'rgba(0, 0, 0, 0.04)',
  },
});
