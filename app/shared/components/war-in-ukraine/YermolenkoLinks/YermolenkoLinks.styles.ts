import { SxProps, Theme } from '@mui/material';

export const styles = {
  fieldsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginTop: '15px'
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: '8px'
  }
} satisfies Record<string, SxProps<Theme>>;