import { SxProps, Theme } from '@mui/material';

export const getStyles = (hasGrip: boolean): Record<string, SxProps<Theme>> => ({
  root: {
    alignItems: hasGrip ? 'center' : 'end', 
  }, 
  summary: {
    alignItems: 'flex-end', 
    '& .MuiAccordionSummary-content': {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: '11.5px',
      margin: '12px 0', 
    },

    '& .MuiAccordionSummary-expandIconWrapper': {
      marginBottom: '13px', 
    }
  },
  gripWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  }
});