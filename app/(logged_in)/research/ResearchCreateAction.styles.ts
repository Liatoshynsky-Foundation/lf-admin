import { SxProps, Theme } from '@mui/material';

import { mainHexPalette as colors } from '~/shared/theme/colors';

export const styles = {
  createButton: {
    borderRadius: '20px',
    px: '24px',
    py: '8px',
    minHeight: '40px',
    textTransform: 'none',
    color: colors.white,
    boxShadow: 'none',
    fontSize: '16px',
    lineHeight: 1.5,
    bgcolor: colors.black,
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
    '&:hover': {
      bgcolor: 'rgb(52, 42, 33)',
      boxShadow: 'none'
    }
  }
} satisfies Record<string, SxProps<Theme>>;