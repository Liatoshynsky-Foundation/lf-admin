export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    gap: 3,
    flexWrap: 'wrap',
    alignItems: 'flex-start'
  },
  section: {
    flex: 1,
    minWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    p: 3,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  languageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    pb: 1
  },
  contentBlock: {
    p: 2,
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
  },
  coverImageContainer: {
    position: 'relative',
    width: '100%',
    height: '300px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  placeholderText: {
    color: 'text.secondary',
    textAlign: 'center'
  },
  fieldLabel: {
    fontWeight: 600,
    mb: 1,
    color: 'text.primary'
  },
  contentText: {
    color: 'text.secondary',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap'
  }
};
