export const styles = {
  container: {
    minHeight: '172px',
    width: '100%',
    borderBottom: '1px solid',
    borderColor: 'blue.500',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2
  },
  
  actionButton: {
    '&.Mui-disabled': {
      cursor: 'not-allowed',
      pointerEvents: 'auto'
    }
  }
};
