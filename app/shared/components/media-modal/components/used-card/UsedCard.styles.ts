import type { SxProps, Theme } from '@mui/material';

export const usedCardStyles = {
  badge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 6px',
    height: '20px',
    borderRadius: '15px',
    border: '1px solid',
    borderColor: 'blue.500',
    backgroundColor: 'blue.900'
  } as SxProps<Theme>,

  badgeText: {
    typography: 'subtitle2',
    letterSpacing: '0.17px',
    textAlign: 'center',
    color: 'blue.300'
  } as SxProps<Theme>
} as const;
