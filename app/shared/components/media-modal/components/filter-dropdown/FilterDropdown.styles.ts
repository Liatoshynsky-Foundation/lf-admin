import type { SxProps, Theme } from '@mui/material';

export const filterDropdownStyles = {
  button: {
    height: '40px',
    letterSpacing: '0.03em',
    padding: '6px 12px 6px 16px',
    borderRadius: '8px',
    backgroundColor: 'blue.200',
    color: 'black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    cursor: 'pointer',
    border: 'none',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'blue.300'
    }
  } as SxProps<Theme>,

  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    height: '28px',
    maxWidth: '140px',
    borderRadius: '14px',
    backgroundColor: 'white',
    color: 'black',
    fontWeight: 400,
    fontStyle: 'italic',
    lineHeight: '100%',
    cursor: 'pointer',
    overflow: 'hidden',
    '&:hover': {
      backgroundColor: 'blue.100'
    }
  } as SxProps<Theme>,

  chipText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
    pr: '3px',
    marginRight: '4px'
  } as SxProps<Theme>,

  closeIcon: {
    fontSize: '16px',
    color: 'black',
    flexShrink: 0
  } as SxProps<Theme>,

  menuItem: {
    justifyContent: 'space-between'
  } as SxProps<Theme>,

  checkIcon: {
    fontSize: '20px',
    color: 'black'
  } as SxProps<Theme>
} as const;
