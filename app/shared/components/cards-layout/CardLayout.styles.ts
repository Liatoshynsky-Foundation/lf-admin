import { alpha } from '@mui/material';

import { mainHexPalette as colors } from '~/shared/theme/colors';

const styles: Record<string, any> = {
  card: (interactive: boolean) => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '266px',
    width: '100%',
    maxWidth: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'blue.200',
    boxShadow: 0,
    cursor: interactive ? 'pointer' : 'default',
    transition: interactive ? 'box-shadow 0.2s, opacity 0.2s' : 'none',
    '&:hover': interactive
      ? {
        opacity: 0.95,
        boxShadow: `0 2px 8px ${alpha(colors.black, 0.1)}`
      }
      : {}
  }),

  imageContainer: {
    width: '100%',
    overflow: 'hidden',
  },

  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '16px',
    overflow: 'hidden',
    padding: '16px !important' ,
  },

  fullInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '8px',
    justifyContent: 'space-between',
    overflow: 'hidden'
  },

  mainInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '4px',
    overflow: 'hidden'
  },

  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%'
  },
};

export const infoText = {
  color: 'blue.600',
  fontStyle: 'italic',
  display: 'block',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: 0,
  flexShrink: 1,
};

export default styles;
