import { SxProps, Theme } from '@mui/material';

export const styles = {
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%'
  },
  textFieldsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    width: '100%',
    mt: 2
  }
} satisfies Record<string, SxProps<Theme>>;
