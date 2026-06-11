import { SxProps, Theme } from '@mui/material';

export const styles = {
  mainPageContentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  activeTabContainer: {
    width: '400px'
  }
} satisfies Record<string, SxProps<Theme>>;
