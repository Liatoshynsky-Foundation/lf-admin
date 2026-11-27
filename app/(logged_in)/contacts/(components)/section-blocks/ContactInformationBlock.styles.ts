import { SxProps, Theme } from '@mui/material';

const columnLayout = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2
} satisfies SxProps<Theme>;

export const styles = {
  container: columnLayout,
  fields: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: 3,
    rowGap: 2,
  },
  localizedField: {
    minWidth: 0
  },
  counter: {
    display: 'block',
    textAlign: 'right',
    color: 'text.secondary',
    lineHeight: 1.5
  },
  phoneField: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    gap: 1
  },
  fullWidthField: {
    gridColumn: '1 / -1'
  }
} satisfies Record<string, SxProps<Theme>>;
