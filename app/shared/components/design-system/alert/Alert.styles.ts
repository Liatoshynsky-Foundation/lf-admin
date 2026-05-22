import { SxProps } from '@mui/material';

import { alertColors } from '~/shared/theme/colors';

export const styles = {
  closeButton: (variant: 'filled' | 'outlined'): SxProps => ({
    typography: 'caption',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 0,
    color: variant === 'outlined' ? alertColors.outlined.label : alertColors.filled.label,

    '& span': {
      margin: '0 12px 0 0'
    },

    '& svg': {
      width: '20px',
      height: '20px',
      color: alertColors.cross
    }
  }),

  description: {
    margin: 0
  }
};
