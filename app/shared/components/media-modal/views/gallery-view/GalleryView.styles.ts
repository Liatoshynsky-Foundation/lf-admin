import { SxProps, Theme } from '@mui/material';

import { sharedViewStyles } from '../shared-view.styles';

export const galleryViewStyles = {
  ...sharedViewStyles,

  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px'
  } as SxProps<Theme>
};
