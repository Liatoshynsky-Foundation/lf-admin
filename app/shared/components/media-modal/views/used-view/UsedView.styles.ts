import type { SxProps, Theme } from '@mui/material';

import { sharedViewStyles } from '../shared-view.styles';

export const usedViewStyles = {
  ...sharedViewStyles,

  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '26px',
    paddingTop: '4px'
  } as SxProps<Theme>
};
