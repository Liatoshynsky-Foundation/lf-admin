import { alpha } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

import { buttonColors, mainHexPalette as colors } from '~/shared/theme/colors';

type Params = {
  padding: number;
  containerCursor: string;
};

export const styles = {
  backdrop: {
    bgcolor: (theme) => alpha(theme.palette.primary.dark, 0.4) 
  } as SxProps<Theme>,

  root: ({ padding }: Pick<Params, 'padding'>): SxProps<Theme> => ({
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: `${padding}px`,
    outline: 'none'
  }),

  viewer: ({ padding, containerCursor }: Params): SxProps<Theme> => ({
    position: 'relative',
    cursor: containerCursor,

    width: `calc(100vw - ${padding * 2}px)`,
    height: `calc(100vh - ${padding * 2}px)`,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none'
  }),

  imageWrap: {
    position: 'relative',
    display: 'inline-block'
  } as SxProps<Theme>,

  closeButton: {
    position: 'absolute',
    top: -32,
    right: -32,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: '16px',
    bgcolor: buttonColors.tertiary.enabledBg,
    boxShadow: `0 2px 10px ${alpha(colors.black, 0.12)}`,
    '&:hover': { bgcolor: buttonColors.tertiary.hoveredBg }
  } as SxProps<Theme>,

  img: ({ padding }: Pick<Params, 'padding'>): SxProps<Theme> => ({
    display: 'block',
    objectFit: 'contain',

    height: `calc(100vh - ${padding * 2}px)`,
    width: 'auto',

    maxWidth: `calc(100vw - ${padding * 2}px)`
  })
};
