import { alpha, keyframes } from '@mui/material';

import { mainHexPalette as colors } from '~/shared/theme/colors';

export const slideIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const slideOut = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(30px); }
`;

export const styles = {
  toastContainer: {
    width: '375px',
    minHeight: '56px',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid',
    typography: 'subtitle1',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    boxShadow: `0px 0px 2px 0px ${alpha(colors.black, 0.08)}, 0px 2px 4px 0px ${alpha(colors.black, 0.08)}`
  },

  contentWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  icon: {
    width: '19.71px',
    height: '19.71px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'adminBlue.800',
    '& svg': {
      width: '100%',
      height: '100%',
      overflow: 'visible'
    }
  },

  message: {
    lineHeight: '1.5',
    wordBreak: 'break-word'
  },

  closeButton: {
    padding: '4px',
    color: 'inherit'
  },

  success: {
    backgroundColor: 'green.100',
    borderColor: 'green.100',
    color: 'green.800'
  },

  error: {
    backgroundColor: 'red.100',
    borderColor: 'red.100',
    color: 'burgundy.600'
  }
};
