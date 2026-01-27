export const styles = {
  container: {
    py: 3,
    px: 4,
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  metadataRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  },
  label: {
    fontWeight: 600,
    color: 'text.secondary',
    minWidth: '140px'
  },
  value: {
    color: 'text.primary'
  },
  statusBadge: {
    px: 2,
    py: 0.5,
    borderRadius: '16px',
    fontSize: '0.875rem',
    fontWeight: 600,
    display: 'inline-block'
  },
  statusDraft: {
    backgroundColor: '#ffeaa7',
    color: '#2d3436'
  },
  statusPublished: {
    backgroundColor: '#55efc4',
    color: '#00b894'
  },
  statusHidden: {
    backgroundColor: '#dfe6e9',
    color: '#636e72'
  },
  statusArchived: {
    backgroundColor: '#fab1a0',
    color: '#e17055'
  },
  statusEditing: {
    backgroundColor: '#74b9ff',
    color: '#0984e3'
  }
};
