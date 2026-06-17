import { SxProps, Theme } from '@mui/material';

import { filterSelectStyles } from '~/shared/components/selector/FilterSelect.styles';
import { mainHexPalette as colors } from '~/shared/theme/colors';

const MENU_ITEM_BASE_SX = {
  ...filterSelectStyles.menuItem,
  minHeight: 'auto',
  px: '12px',
  py: '8px',
  borderRadius: '8px'
} satisfies SxProps<Theme>;

export const styles = {
  pageContainer: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  menuList: {
    px: '8px',
    py: '4px',
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
  createDropdownMenu: {
    '& .MuiPaper-root': {
      width: '170px'
    }
  }
} satisfies Record<string, SxProps<Theme>>;
