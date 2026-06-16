import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  imageSection: {
    position: 'relative',
    width: '100%',
    height: '225px',
    overflow: 'hidden',
    backgroundColor: 'adminBlue.100'
  },

  fileTitle: {
    color: 'text.primary',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    wordBreak: 'break-all',
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

  metadataSection: {
    display: 'flex',
    height: '32px',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
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
