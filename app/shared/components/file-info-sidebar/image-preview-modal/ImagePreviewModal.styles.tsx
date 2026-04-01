import type { SxProps, Theme } from '@mui/material/styles';

import { colors } from '../../design-system/button/Button.styles';

type Params = {
  padding: number;
  containerCursor: string;
};

export const styles = {
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

  closeButton: (): SxProps<Theme> => ({
    position: 'absolute',
    top: -32,
    right: -32,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: '16px',
    bgcolor: colors.yellow[500],
    boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
    '&:hover': { bgcolor: '#d1a94cff' }
  }),

  img: ({ padding }: Pick<Params, 'padding'>): SxProps<Theme> => ({
    display: 'block',
    objectFit: 'contain',

    height: `calc(100vh - ${padding * 2}px)`,
    width: 'auto',

    maxWidth: `calc(100vw - ${padding * 2}px)`
  })
};
