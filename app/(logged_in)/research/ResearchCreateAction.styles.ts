import { SxProps, Theme } from '@mui/material';

import { mainHexPalette as colors } from '~/shared/theme/colors';

export const styles = {
  createButton: {
    width: 'fit-content',
    borderRadius: '28px',
    px: '24px',
    py: '8px',
    minHeight: '40px',
    textTransform: 'none',
    color: colors.white,
    boxShadow: 'none',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: 1.5,
    bgcolor: colors.black,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    cursor: 'pointer',
    '&:hover': {
      bgcolor: 'rgb(52, 42, 33)',
      boxShadow: 'none'
    }
  },
  icon: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
    position: 'relative',
    top: '2px',
    left: '-4px'
  }
} satisfies Record<string, SxProps<Theme>>;