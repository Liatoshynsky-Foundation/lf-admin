import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    width: '100%',
    maxWidth: '100%',
    height: '325px',
    borderRadius: '16px',
    borderColor: 'blue.300',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'opacity 0.2s, box-shadow 0.2s',
    '&:hover': {
      opacity: 0.95,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }
  },

  imageSection: {
    position: 'relative',
    width: '100%',
    height: '225px',
    overflow: 'hidden',
    backgroundColor: 'adminBlue.100'
  },

  fileTitle: {
    lineHeight: '1.5'
  },

  fileDate: {
    fontSize: '16px',
    fontStyle: 'italic',
    color: 'text.secondary',
    lineHeight: '1'
  },

  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'adminBlue.100'
  },

  fileInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '16px',
    padding: '0 16px',
    gap: '8px'
  },

  metadataSection: {
    display: 'flex',
    height: '32px',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    marginBottom: '16px',
    flexShrink: 0
  },

  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    '&:hover': {
      opacity: 0.7
    }
  }
};
