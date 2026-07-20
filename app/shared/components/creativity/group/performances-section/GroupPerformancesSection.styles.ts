import {SxProps, Theme} from '@mui/material';

export const styles = {
  tooltipView: {width: '200px', borderRadius: '4px', display: 'block', mb: 1 },
  videoText: { color: 'white', display: 'block', textAlign: 'center' },
  linkText: { color: 'blue', textDecoration: 'none', padding: '4px 8px', display: 'block' },
  mainContainer: { display: 'flex', flexDirection: 'column', gap: 3, mt: 2 },
  headerRow: { display: 'flex', alignItems: 'center', gap: 2 },
  typographyTitle: { fontWeight: 500 },
  divider: { flexGrow: 1},
  performancesList: { display: 'flex', flexDirection: 'column', gap: 4 },
  performanceItemRow: { display: 'flex', alignItems: 'start', gap: 2 , flexGrow: 1 },
  inputsWrapper: { display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 },
  tooltipBox: {padding: '8px', backgroundColor: 'gray.800'},
  actionIcon: { color: 'black', width: '34px', height: '34px' },
  addBtnWrapper: { display: 'flex', justifyContent: 'center', mt: 1 },
  addBtn: { borderRadius: '20px', textTransform: 'none' },
} satisfies Record<string, SxProps<Theme>>;
