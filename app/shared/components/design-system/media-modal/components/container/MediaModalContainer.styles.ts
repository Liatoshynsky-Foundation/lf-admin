import { mediaModalTokens as t } from '../../MediaModal.tokens';

export const styles = {
  dialog: {
    '& .MuiBackdrop-root': {
      backgroundColor: t.backdrop
    }
  },

  paper: {
    width: {
      xs: 'calc(100vw - 24px)',
      sm: '912px'
    },
    height: {
      xs: 'calc(100vh - 24px)',
      sm: '787px'
    },
    borderRadius: '32px',
    p: {
      xs: '24px',
      sm: '40px'
    },

    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflow: 'hidden',

    backgroundColor: t.surface,
    color: t.text
  },

  header: {
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: '16px',
    minHeight: '40px'
  },

  headerLeft: {
    minWidth: 0
  },
  headerCenter: {
    justifySelf: 'center'
  },

  headerRight: {
    justifySelf: 'end',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px'
  },

  closeButton: {
    color: t.text,
    '&:hover': {
      backgroundColor: t.hoverSoft
    }
  },

  body: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto'
  },

  footer: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },

  footerBottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap'
  },

  footerLeft: {
    minWidth: 0
  },
  footerRight: {
    display: 'flex',
    gap: '16px'
  }
};
