import { SxProps, Theme } from '@mui/material';

export const filterButtonStyles = {
  button: (active: boolean): SxProps<Theme> => ({
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
    },
    ...(active && {
      backgroundColor: '#FCBD28',
      color: '#000'
    })
  })
};
