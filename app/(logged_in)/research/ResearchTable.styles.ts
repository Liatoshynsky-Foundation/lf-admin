import { SxProps, Theme } from '@mui/material';

export const styles = {
  researchListContainer: {
    pt: '12px'
  },
  datesCell: {
    fontSize: '16px',
    fontWeight: 600,
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
    minWidth: 0
  }
} satisfies Record<string, SxProps<Theme>>;
