import { SxProps, Theme } from '@mui/material';

export const imageCardStyles = {
  container: (isSelected: boolean, isCurrentlyUsed: boolean): SxProps<Theme> => ({
    position: 'relative',
    width: '196px',
    height: '163px',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    border: isSelected ? '2px solid #FCBD28' : isCurrentlyUsed ? '2px solid #B2B3BE' : '2px solid transparent',
    transition: 'all 0.2s ease',
    backgroundColor: '#424242',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      opacity: 0.85,
      transform: 'scale(1.02)'
    }
  }),

  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  } as SxProps<Theme>,

  badge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '10px',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
    color: '#000'
  } as SxProps<Theme>,

  usedCheckmark: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } as SxProps<Theme>
};
