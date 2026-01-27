export const styles = {
  container: {
    minHeight: '80px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    py: 2,
    px: 4,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
    fontFamily: 'Mulish',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  backButton: {
    color: 'text.primary',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flex: 1
  }
};
