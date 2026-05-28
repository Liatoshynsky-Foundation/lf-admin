import { alpha, SxProps, Theme } from '@mui/material';

import { mainHexPalette as colors } from '~/shared/theme/colors';

export const styles = {
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    my: 1
  },
  fileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    p: 1.5,
    pr: 2,
    borderRadius: 2,
    cursor: 'pointer',
    backgroundColor: 'background.default',
    '&:hover': { backgroundColor: 'action.hover' }
  },
  fileIconBox: {
    p: 1,
    backgroundColor: 'primary.light',
    borderRadius: 1,
    color: 'primary.main',
    display: 'flex'
  },
  fileName: {
    fontWeight: 500
  },
  imageStateContainer: {
    position: 'relative',
    '&:hover .overlay-controls': { opacity: 1 }
  },
  resizeHandle: {
    position: 'absolute',
    right: -12,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 24,
    height: 48,
    backgroundColor: alpha(colors.black, 0.5),
    color: 'white',
    borderRadius: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'col-resize',
    opacity: 0,
    transition: 'opacity 0.2s',
    '&:hover': { backgroundColor: 'primary.main', opacity: 1 }
  },
  captionInput: {
    color: 'text.secondary',
    fontSize: '0.875rem'
  }
} satisfies Record<string, SxProps<Theme>>;
