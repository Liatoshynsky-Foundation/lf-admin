import { SxProps, Theme } from '@mui/material';

export const galleryCardStyles = {
  iconsWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '2px 8px',
    height: '20px',
    borderRadius: '15px',
    border: '1px solid #9D9FA9',
    backgroundColor: '#3F444A',
    color: '#C6C8D3',
    cursor: 'help',
    '&:hover': {
      backgroundColor: '#4A5056'
    }
  } as SxProps<Theme>,

  tooltip: {
    sx: {
      backgroundColor: '#3F444A',
      fontFamily: 'Mulish',
      fontWeight: 400,
      fontStyle: 'italic',
      fontSize: '14px',
      lineHeight: '140%',
      letterSpacing: 0,
      textAlign: 'center',
      color: '#FCFCFC',
      padding: '4px 16px',
      borderRadius: '20px',
      boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.07)',
      '& .MuiTooltip-arrow': {
        color: '#3F444A'
      }
    }
  } as const
};
