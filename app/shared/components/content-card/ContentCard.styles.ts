const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '100%',
    borderRadius: '16px',
    border: '1px solid #D9DCE8'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexGrow: '1'
  },
  title: {
    fontSize: '18px',
    fontWeight: 700,
    flex: 1,
    color: '#190D03'
  },
  date: {
    color: '#898C95',
    fontStyle: 'italic'
  },
  mainInfo: {
    display: 'flex',
    gap: '15px',
    alignItems: 'baseline'
  }
};

export default styles;
