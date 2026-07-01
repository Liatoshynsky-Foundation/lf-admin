import { SxProps, Theme } from '@mui/material';

export const styles = {
  mainContainer: { display: 'flex', flexDirection: 'column', gap: 3, mt: 2 },
  headerRow: { display: 'flex', alignItems: 'center', gap: 2 },
  divider: { flexGrow: 1 },
  addBtnTop: {
    backgroundColor: 'black',
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgb(52, 42, 33)'
    }
  },
  worksList: { display: 'flex', flexDirection: 'column', gap: 2 },
  workItemRow: { display: 'flex', alignItems: 'center', gap: 2 },
  autocompleteWrapper: { flexGrow: 1 },
  autocompletePaper: {
    borderRadius: '12px',
    mt: 1,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden'
  },
  createWorkBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    px: 2,
    py: '6px',
    cursor: 'pointer',
    color: 'text.primary',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'action.hover'
    }
  },
  createWorkText: { fontSize: '16px' },
  actionButtonsWrapper: { display: 'flex', gap: 1 },
  actionIcon: { color: 'black', width: '34px', height: '34px' }
} satisfies Record<string, SxProps<Theme>>;
