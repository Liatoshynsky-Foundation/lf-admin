import { SxProps, Theme } from '@mui/material';

const columnLayout = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2
} satisfies SxProps<Theme>;

export const styles = {
  container: columnLayout,
  fields: columnLayout
} satisfies Record<string, SxProps<Theme>>;
