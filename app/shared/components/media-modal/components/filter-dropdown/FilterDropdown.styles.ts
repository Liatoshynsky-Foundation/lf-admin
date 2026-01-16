import type { SxProps, Theme } from '@mui/material';

export const filterDropdownStyles = {
  button: {
    height: '40px',
    letterSpacing: '0.03em',
    padding: '6px 8px 6px 16px',
    borderRadius: '8px',
    backgroundColor: '#D9DCE8',
    color: '#190D03',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'Mulish',
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '150%',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#C5C9D5'
    }
  } as SxProps<Theme>,

  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    height: '28px',
    maxWidth: '140px',
    borderRadius: '14px',
    backgroundColor: '#FCFCFC',
    color: '#000',
    fontFamily: 'Mulish',
    fontSize: '16px',
    fontWeight: 400,
    fontStyle: 'italic',
    lineHeight: '100%',
    cursor: 'pointer',
    overflow: 'hidden',
    '&:hover': {
      backgroundColor: '#F0F0F0'
    }
  } as SxProps<Theme>,

  chipText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
    paddingRight: '3px',
    marginRight: '4px'
  } as SxProps<Theme>,

  closeIcon: {
    fontSize: '16px',
    color: '#000',
    flexShrink: 0
  } as SxProps<Theme>,

  menuItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    gap: '16px',
    fontFamily: 'Mulish',
    fontSize: '16px',
    fontWeight: 400,
    color: '#000'
  } as SxProps<Theme>,

  checkIcon: {
    fontSize: '20px',
    color: '#000'
  } as SxProps<Theme>
} as const;
