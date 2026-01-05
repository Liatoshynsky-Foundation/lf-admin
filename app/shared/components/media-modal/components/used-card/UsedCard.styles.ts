import type { SxProps, Theme } from '@mui/material';

export const usedCardStyles = {
  badge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 6px',
    height: '20px',
    borderRadius: '15px',
    border: '1px solid #9D9FA9',
    backgroundColor: '#3F444A'
  } as SxProps<Theme>,

  badgeText: {
    fontFamily: 'Mulish',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '130%',
    letterSpacing: '0.17px',
    textAlign: 'center',
    color: '#C6C8D3'
  } as SxProps<Theme>
} as const;
