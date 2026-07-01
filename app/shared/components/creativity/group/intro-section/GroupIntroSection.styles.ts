import {SxProps, Theme} from '@mui/material';

export const styles = {
  mainContainer: { display: 'flex', flexDirection: 'column', gap: 2 },
  partsTextField: {
    '& .MuiInputBase-root': {
      height: 'auto',
      padding: '12px 16px',
    }
  },
} satisfies Record<string, SxProps<Theme>>;
