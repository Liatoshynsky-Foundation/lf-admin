import { SxProps, Theme } from '@mui/material';

import { filterSelectStyles } from '~/shared/components/selector/FilterSelect.styles';
import { mainHexPalette as colors } from '~/shared/theme/colors';

export const styles = {
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'minmax(0, 1fr)',
      sm: 'repeat(2, minmax(0, 1fr))',
      md: 'repeat(3, minmax(0, 1fr))',
      xl: 'repeat(4, minmax(0, 1fr))'
    },
    gap: '16px',
    width: '100%'
  },
  cardWrapper: {
    minWidth: 0,
    display: 'flex'
  },
  pageContainer: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  createActionButton: {
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
  createActionDropdownMenu: {
    '& .MuiPaper-root': {
      width: '170px'
    }
  },
  menuListWrapper: {
    px: '8px',
    py: '4px'
  },
  createActionMenuItem: {
    ...filterSelectStyles.menuItem,
    minHeight: 'auto',
    px: '12px',
    py: '8px',
    borderRadius: '8px',
    color: colors.black,
    '&:hover': {
      bgcolor: 'rgba(0, 0, 0, 0.04)'
    },
    '&.Mui-focusVisible': {
      bgcolor: 'rgba(0, 0, 0, 0.04)'
    }
  }
} satisfies Record<string, SxProps<Theme>>;
