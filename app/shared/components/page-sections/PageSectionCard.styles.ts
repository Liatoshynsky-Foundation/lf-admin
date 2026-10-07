import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    width: '100%',
    minWidth: 0
  },
  itemContent: {
    flex: 1,
    minWidth: 0
  },
  trashButton: {
    flexShrink: 0,
    width: 40,
    height: 40,
    color: 'error.main'
  },
  addBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  }
};
