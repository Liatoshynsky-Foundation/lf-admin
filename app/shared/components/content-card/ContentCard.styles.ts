const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '100%',
    borderRadius: '16px',
    border: '1px solid',
    borderColor: 'blue.200'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexGrow: '1'
  },
  title: {
    fontWeight: 700,
    flex: 1,
    color: 'text.primary'
  },
  date: {
    color: 'blue.600',
    fontStyle: 'italic'
  },
  mainInfo: {
    display: 'flex',
    gap: '15px',
    alignItems: 'baseline'
  }
};

export default styles;
