import { alpha } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

import { mainHexPalette as colors } from '~/shared/theme/colors';

export const SIDEBAR_WIDTH = 320;

export const styles = {
  root: {
    width: `${SIDEBAR_WIDTH}px`,
    height: '100dvh',
    bgcolor: colors.blue[100],

    position: 'fixed',
    top: 0,
    right: 0,

    display: 'flex',
    flexDirection: 'column',

    py: '32px',
    px: '24px',
    gap: '16px',
    pt: 0,

    overflowY: 'auto',
    scrollbarWidth: 'none'
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 2,

    bgcolor: colors.blue[100],

    mx: '-24px',
    px: '24px',
    pt: '30px',
    pb: '10px',

    display: 'grid',
    gridTemplateColumns: '28px 1fr 28px',
    columnGap: '4px',
    alignItems: 'start'
  },

  headerIcon: {
    width: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    color: 'text.primary'
  },

  headerTitle: {
    minWidth: 0,
    fontWeight: 700,
    lineHeight: '1.4',
    letterSpacing: 0,

    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },

  closeBtn: {
    width: 28,
    height: 28,
    p: 0,
    alignSelf: 'start',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    mt: '-10px'
  },
  actionBtn: {
    width: 32,
    height: 32,
    p: 0
  },
  actionsSpacer: {
    flex: 1
  },
  preview: (isImagePreview: boolean) => ({
    height: '224px',
    flexShrink: 0,
    border: '1px solid',
    borderColor: colors.blue[400],
    borderRadius: '20px',

    overflow: 'hidden',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    bgcolor: 'transparent',
    position: 'relative',
    '&:hover .previewOverlay': { opacity: 1, pointerEvents: 'auto' },

    userSelect: 'none',
    outline: 'none',
    cursor: isImagePreview ? 'pointer' : 'default'
  }),

  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block'
  },
  lastBlock: {
    px: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1
  },
  sectionTitle: {
    fontWeight: 700
  },
  userRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  userAvatar: {
    height: '34px',
    width: '34px'
  },
  rowText: {
    fontWeight: 600,
    color: colors.blue[800]
  },
  columnText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  usageLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    pl: 0,
    m: 0,
    listStyle: 'none'
  },

  usageLink: {
    fontWeight: 600,
    textDecoration: 'underline',
    overflowWrap: 'anywhere',
    color: colors.blue[800]
  },

  descriptionField: (theme: Theme): SxProps<Theme> => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: 'transparent'
    },

    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.blue[500]
    },

    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.blue[600]
    },

    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.blue[800]
    },

    '& .MuiInputBase-inputMultiline': {
      ...theme.typography.textMd
    },

    '& .MuiInputBase-inputMultiline::placeholder': {
      ...theme.typography.textMd,
      color: colors.blue[800],
      opacity: 1
    }
  }),

  starFilled: {
    '& svg': { display: 'block' },
    '& svg path': { fill: 'black' },
    '& svg *': { stroke: 'black' }
  },
  previewOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: alpha(colors.blue[900], 0.4),
    opacity: 0,
    transition: 'opacity 300ms ease-out',
    pointerEvents: 'none',
    borderRadius: 'inherit'
  },

  zoomIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
