import { alpha, SxProps, Theme } from '@mui/material';

import { mainHexPalette as colors } from '~/shared/theme/colors';

const styles: Record<string, SxProps<Theme>> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '266px',
    width: '100%',
    maxWidth: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'blue.200',
    boxShadow: `0px 1px 4px ${alpha(colors.black, 0.08)}`
  },

  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '8px',
    p: '12px',
    overflow: 'hidden',
    '&:last-child': {
      pb: '12px'
    }
  },

  mainInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '4px'
  },

  title: {
    fontWeight: 700,
    color: 'text.primary',
    flex: 1,
    minWidth: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },

  menuButton: {
    borderRadius: '50%',
    color: 'text.secondary',
    mr: '4px',
    mt: '2px',
    transition: 'box-shadow 0.2s ease-in-out, background-color 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.15)'
    },
    '&.active': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.15)'
    }
  },
  
  date: {
    color: 'blue.600',
    fontStyle: 'italic',
    mt: 'auto',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

export default styles;
