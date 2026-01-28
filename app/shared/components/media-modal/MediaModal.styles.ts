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

  headerIconButton: {
    color: '#FCFCFC',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.08)'
    },
    '&.Mui-disabled': {
      color: 'rgba(193, 201, 214, 0.6)'
    }
  },

  footerBackButton: {
    padding: '8px 24px'
  }
};
