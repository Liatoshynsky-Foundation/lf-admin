import { SxProps, Theme } from '@mui/material';

import { baseTextStyles } from '~/shared/theme/theme';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    overflow: 'hidden',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'blue.200',
    padding: '24px',
    '& .bn-container': {
      width: '100%'
    },
    '& .bn-editor': {
      minHeight: '400px'
    },
    // Hide native file input when using custom file picker
    '&.custom-file-picker-enabled': {
      '& input[type="file"]': {
        display: 'none !important',
        pointerEvents: 'none'
      }
    }
  },
  loadingPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: 'blue.800',
    ...baseTextStyles
  }
};
