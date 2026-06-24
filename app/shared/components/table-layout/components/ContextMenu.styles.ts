import { SxProps, Theme } from '@mui/material';

import { tableDividerColor } from '../TableLayout.styles';
import { filterSelectStyles } from '~/shared/components/selector/FilterSelect.styles';

const menuItems = {
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
    ...menuItems,
  },
  divider: {
    height: '1px',
    backgroundColor: tableDividerColor,
    my: '8px',
  },
};

export const getContextMenuDropdownItem = (isDanger?: boolean): SxProps<Theme> => ({
  ...menuItems,
  '&:hover': {
    bgcolor: isDanger ? 'rgba(211,47,47,0.04)' : 'rgba(0, 0, 0, 0.04)',
  },
});
