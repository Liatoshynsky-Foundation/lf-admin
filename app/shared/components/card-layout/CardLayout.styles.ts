import { alpha, SxProps, Theme } from '@mui/material';

import { mainHexPalette as colors } from '~/shared/theme/colors';

const styles = {
  card: (interactive: boolean, isSelected = false): SxProps<Theme> => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '266px',
    width: '100%',
    maxWidth: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: isSelected ? 'blue.700' : 'blue.200',
    backgroundColor: isSelected ? 'adminBlue.100' : 'white',
    boxShadow: 0,
    cursor: interactive ? 'pointer' : 'default',
    transition: interactive ? 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s, opacity 0.2s' : 'none',
    '&:hover': interactive
      ? {
        opacity: 0.95,
        backgroundColor: 'adminBlue.100',
        boxShadow: `0 2px 8px ${alpha(colors.black, 0.1)}`
      }
      : {}
  }),

  imageContainer: {
    width: '100%',
    overflow: 'hidden',
  } as SxProps<Theme>,

  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '16px',
    overflow: 'hidden',
    padding: '16px !important' ,
  } as SxProps<Theme>,

  fullInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '8px',
    justifyContent: 'space-between',
    overflow: 'hidden'
  } as SxProps<Theme>,

  mainInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '4px',
    overflow: 'hidden'
  } as SxProps<Theme>,

  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%'
  } as SxProps<Theme>
};

export const infoText: SxProps<Theme> = {
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
