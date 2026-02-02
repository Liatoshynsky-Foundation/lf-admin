export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    gap: 3,
    flexWrap: 'wrap',
    alignItems: 'stretch',
    px: 4
  },
  section: {
    flex: '1 1 0',
    minWidth: '400px',
    maxWidth: '50%',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    backgroundColor: '#fafafa',
    border: '1px solid #e0e0e0',
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
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column'
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
