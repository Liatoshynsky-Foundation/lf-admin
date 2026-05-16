import { alpha,SxProps, Theme  } from '@mui/material';

import { mainHexPallete as colors } from '~/shared/theme/colors';

export const mediaCardStyles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    border: '1px solid',
    borderColor: 'blue.900',
    borderRadius: '6px',
    overflow: 'hidden'
  } as SxProps<Theme>,

  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '160px',
    cursor: 'pointer',
    backgroundColor: 'blue.900',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    '&:hover': {
      opacity: 0.85
    }
  } as SxProps<Theme>,

  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  } as SxProps<Theme>,

  topLeft: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    display: 'flex',
    gap: '4px'
  } as SxProps<Theme>,

  topRight: {
    position: 'absolute',
    top: '8px',
    right: '8px'
  } as SxProps<Theme>,

  bottom: {
    padding: '8px 8px',
    backgroundColor: alpha(colors.charcoalGray, 0.3),
    color: 'white',
    fontSize: '14px',
    fontWeight: 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  } as SxProps<Theme>
};
