import { keyframes } from '@mui/material';

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
    minWidth: '320px',
    maxWidth: '320px',
    minHeight: '56px',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid',
    fontSize: '18px',
    fontWeight: 500,
    fontFamily: 'Mulish',
    lineHeight: '1.5',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.08), 0px 2px 4px 0px rgba(0, 0, 0, 0.08)'
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
    '& svg': {
      width: '100%',
      height: '100%',
      overflow: 'visible'
    }
  },
  message: {
    fontSize: '18px',
    fontWeight: 500,
    fontFamily: 'Mulish',
    lineHeight: '1.5'
  },
  closeButton: {
    padding: '4px',
    color: 'inherit'
  },
  success: {
    backgroundColor: '#E2F2DC',
    borderColor: '#579A40',
    color: '#2C4D20'
  },
  error: {
    backgroundColor: '#fde7e7',
    borderColor: '#ef4343',
    color: '#981b1b'
  }
};
