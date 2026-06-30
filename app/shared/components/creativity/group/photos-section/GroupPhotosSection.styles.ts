import { SxProps, Theme } from '@mui/material';

export const styles = {
  mainContainer: { display: 'flex', flexDirection: 'column', gap: 3, mt: 2 },
  photosList: { display: 'flex', flexDirection: 'column', gap: 4 },
  photoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  photoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 },
  typographyIndex: { fontWeight: 500 },
  divider: { flexGrow: 1 },
  actionIcon: { color: 'black', width: '34px', height: '34px' },
  captionWrapper: { display: 'flex', gap: 2 },
  captionInputWrapper: { flex: 1 },
  addBtnWrapper: { display: 'flex', justifyContent: 'center', mt: 1 }
} satisfies Record<string, SxProps<Theme>>;
