import { alpha, SxProps, Theme } from '@mui/material';

import { mainHexPalette as colors } from '~/shared/theme/colors';

const styles: Record<string, SxProps<Theme>> = {
  touchable: {
    '&:hover': {
      opacity: 0.95,
      boxShadow: `0 2px 8px ${alpha(colors.black, 0.1)}`
    }
  },

  title: {
    fontWeight: 700,
    color: 'text.primary',
    flex: 1,
    minWidth: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  date: {
    color: 'blue.600',
    fontStyle: 'italic',
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    minWidth: 0,
    flexShrink: 1,
  }
};

export default styles;
