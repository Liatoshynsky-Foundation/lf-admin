import { SxProps, Theme } from '@mui/material';

export const getStyles = (hasGrip: boolean, isHidden: boolean = false): Record<string, SxProps<Theme>> => ({
  root: {
    alignItems: hasGrip ? 'center' : 'end',
    opacity: isHidden ? 0.5 : 1,
    transition: 'opacity 0.2s ease'
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
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  visibilityToggle: {
    padding: '2px'
  }
});
