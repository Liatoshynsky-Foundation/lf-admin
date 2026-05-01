import type { SxProps, Theme } from '@mui/material';

import { mainHexPallete as colors } from '~/shared/theme/colors';

export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    p: '24px',
    textAlign: 'center'
  } satisfies SxProps<Theme>,

  icon: {
    mb: '4px'
  } satisfies SxProps<Theme>,

  title: {
    color: colors.black
  } satisfies SxProps<Theme>,

  description: {
    color: colors.black,
    maxWidth: '480px',
    whiteSpace: 'pre-line'
  } satisfies SxProps<Theme>,

  actionButton: {
    mt: '8px',
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
    '&:hover': {
      bgcolor: colors.blue[900],
      boxShadow: 'none'
    }
  } satisfies SxProps<Theme>
};
