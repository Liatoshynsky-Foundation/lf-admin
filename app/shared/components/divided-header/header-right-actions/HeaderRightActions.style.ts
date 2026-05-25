import { SxProps, Theme } from '@mui/material';

export const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  } as SxProps<Theme>,

  icon: { color: 'text.primary' },

  group: {
    display: 'flex',
    gap: '2px'
  } as SxProps<Theme>,

  groupLeft: { borderRadius: '28px 0 0 28px', px: 3 } as SxProps<Theme>,
  groupRight: { borderRadius: '0 28px 28px 0', p: '8px 24px 8px 14px' } as SxProps<Theme>
};
