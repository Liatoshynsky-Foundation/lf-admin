import { SxProps, Theme } from '@mui/material';

export const getStyles = (hasGrip: boolean, isHidden: boolean = false, isSaving: boolean = false): Record<string, SxProps<Theme>> => {
  let opacity = 1;
  if (isSaving) {
    opacity = 0.6;
  } else if (isHidden) {
    opacity = 0.5;
  }

  return {
    root: {
      alignItems: hasGrip ? 'center' : 'end',
      opacity,
      pointerEvents: isSaving ? 'none' : 'auto',
      transition: 'opacity 0.2s ease',
      overflow: 'visible'
    },
    summary: {
      alignItems: 'flex-end',
      overflow: 'visible',
      '& .MuiAccordionSummary-content': {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '11.5px',
        margin: '12px 0',
        overflow: 'visible'
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
      gap: '8px',
      minWidth: 0,
      overflow: 'visible'
    },
    titleText: {
      minWidth: 0,
      overflow: 'visible',
      whiteSpace: 'normal'
    },
    visibilityToggle: {
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      padding: 0,
      margin: 0,
      boxSizing: 'border-box',
      overflow: 'visible',
      lineHeight: 0,
      borderRadius: '50%',
      cursor: 'pointer',
      color: 'inherit',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)'
      },
      '&:focus-visible': {
        outline: '2px solid currentColor',
        outlineOffset: '1px'
      }
    }
  };
};
