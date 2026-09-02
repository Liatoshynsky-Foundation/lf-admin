import { SxProps, Theme } from '@mui/material';

export const styles = {
  container: { display: 'flex', alignItems: 'center', gap: 1 },
  divider: { flexGrow: 1 }
} satisfies Record<string, SxProps<Theme>>;
