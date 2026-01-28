export const styles = {
  viewContainer: {
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      '& .edit-icon': {
        opacity: 1
      }
    }
  },
  textContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    position: 'relative'
  },
  text: {
    flex: 1,
    wordBreak: 'break-word'
  },
  editIcon: {
    opacity: 0,
    transition: 'opacity 0.2s',
    color: 'text.secondary',
    flexShrink: 0
  },
  editContainer: {
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  textField: {
    '& .MuiInputBase-root': {
      backgroundColor: 'background.paper'
    }
  },
  buttonGroup: {
    display: 'flex',
    gap: 1,
    justifyContent: 'flex-start'
  },
  label: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'text.secondary',
    marginBottom: '4px'
  }
};
