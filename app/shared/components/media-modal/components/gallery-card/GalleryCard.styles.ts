import { SxProps, Theme } from '@mui/material';

export const styles = {
  iconsWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '2px 8px',
    height: '20px',
    borderRadius: '15px',
    border: '1px solid',
    borderColor: 'blue.500',
    backgroundColor: 'blue.900',
    color: 'blue.300',
    cursor: 'help',
    '&:hover': {
      backgroundColor: 'blue.800'
    }
  } as SxProps<Theme>,

  tooltipTitle: {
    fontWeight: 600,
    marginBottom: '4px'
  } as SxProps<Theme>,

  iconContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  } as SxProps<Theme>
};
