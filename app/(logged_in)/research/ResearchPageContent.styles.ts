import { SxProps, Theme } from '@mui/material';

import { mainHexPalette as colors } from '~/shared/theme/colors';

export const styles = {
  pageContainer: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
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
  }
} satisfies Record<string, SxProps<Theme>>;