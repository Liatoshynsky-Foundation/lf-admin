import { mediaModalTokens as t } from './MediaModal.tokens';

export const styles = {
  cropHeader: {
    display: 'grid',
    gap: '4px',
    alignItems: 'start'
  },

  cropHeaderTitle: {
    fontWeight: 700,
    fontSize: '24px',
    lineHeight: '140%',
    color: t.text
  },

  cropHeaderSubtitle: {
    fontWeight: 500,
    fontSize: '18px',
    lineHeight: '150%',
    color: '#C1C9D6'
  },

  headerIconButton: {
    color: t.text,
    '&:hover': {
      backgroundColor: t.hoverSoft
    }
  },

  footerBackButton: {
    padding: '8px 24px'
  },

  splitApply: {
    display: 'inline-flex',
    alignItems: 'stretch',
    gap: 0
  },

  splitApplyMenuButton: {
    borderRadius: '0 999px 999px 0',
    border: `1px solid ${t.accent}`,
    borderLeft: 'none',
    minWidth: 52,
    px: 1.5,
    color: '#232529',
    backgroundColor: t.accent,
    '&:hover': {
      backgroundColor: t.accent
    }
  },

  splitApplyMainButtonSx: {
    borderRadius: '999px 0 0 999px'
  }
};
