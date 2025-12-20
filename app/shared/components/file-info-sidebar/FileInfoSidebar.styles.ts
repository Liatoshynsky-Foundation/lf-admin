import { colors } from '../design-system/button/Button.styles';

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

    overflowY: 'scroll',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(0,0,0,0.18) transparent',

    '&::-webkit-scrollbar': {
      width: '8px'
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,0.18)',
      borderRadius: '999px',
      border: '2px solid transparent',
      backgroundClip: 'content-box'
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'rgba(0,0,0,0.28)'
    }
  },
  header: {
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
    fontFamily: 'Mulish, sans-serif',
    fontWeight: 700,
    fontSize: 20,
    lineHeight: '140%',
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
    alignSelf: 'start'
  },
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  actionBtn: {
    width: 32,
    height: 32,
    p: 0
  },

  actionsSpacer: {
    flex: 1
  },
  preview: {
    height: '224px',
    flexShrink: 0,
    border: '1px solid',
    borderColor: colors.blue[400],
    borderRadius: '20px',

    overflow: 'hidden',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    bgcolor: 'transparent'
  },

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
    fontFamily: 'Mulish, sans-serif',
    fontWeight: 700,
    fontSize: 14,
    lineHeight: '130%',
    letterSpacing: '0.17px'
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
    fontFamily: 'Mulish, sans-serif',
    fontWeight: 600,
    fontSize: 16,
    lineHeight: '150%',
    letterSpacing: 0,
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
    fontFamily: 'Mulish, sans-serif',
    fontWeight: 600,
    fontSize: 16,
    lineHeight: '150%',
    textDecoration: 'underline',
    overflowWrap: 'anywhere',
    color: colors.blue[800]
  },

  descriptionField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: 'transparent'
    },

    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#A7A8B4'
    },

    '& .MuiInputBase-inputMultiline': {
      fontFamily: 'Mulish, sans-serif',
      fontWeight: 600,
      fontSize: '16px',
      lineHeight: '150%'
    },

    '& .MuiInputBase-inputMultiline::placeholder': {
      fontFamily: 'Mulish, sans-serif',
      fontWeight: 400,
      color: '#00000061',
      opacity: 1
    }
  }
} as const;
