import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    width: '100%',
    maxWidth: '100%',
    height: '325px',
    borderRadius: '16px',
    borderColor: '#C6C8D3',
    backgroundColor: '#FCFCFC',
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
    backgroundColor: '#F1F2F7'
  },

  fileTitle: {
    fontSize: '18px'
  },

  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F2F7'
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
