import { SxProps, Theme } from '@mui/material';

import { chipsColors } from '~/shared/theme/colors';

export const styles: Record<string, SxProps<Theme>> = {
  mainCompositionIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: chipsColors.published,
    color: 'adminBlue.50'
  },

  imageSection: {
    position: 'relative',
    width: '100%',
    height: '225px',
    overflow: 'hidden',
    backgroundColor: 'adminBlue.100'
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
