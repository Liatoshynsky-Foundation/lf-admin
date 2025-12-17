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
    color: '#FCFCFC'
  },

  cropHeaderSubtitle: {
    fontWeight: 500,
    fontSize: '18px',
    lineHeight: '150%',
    color: '#C1C9D6'
  },

  selectedFileRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '9.5px'
  },

  selectedFileIcon: {
    color: '#F7F8FC',
    flexShrink: 0
  },

  selectedFileName: {
    fontSize: 18,
    color: '#C1C9D6'
  },

  footerActionButton: {
    padding: '8px 48px'
  },

  checkboxLabel: {
    userSelect: 'none',
    gap: '4px',
    m: 0
  },

  checkbox: {
    width: '38px',
    height: '38px',
    color: t.accent,
    '&.Mui-checked': {
      color: t.accent
    }
  }
};
