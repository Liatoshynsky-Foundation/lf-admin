'use client';

import { Box, IconButton, Typography } from '@mui/material';
import { resolveValue,toast, Toaster as HotToaster } from 'react-hot-toast';

import { slideIn, slideOut,styles } from './Toaster.styles';
import ToastClose from '~/public/icons/toast-close.svg';
import ToastError from '~/public/icons/toast-error.svg';
import ToastSuccess from '~/public/icons/toast-success.svg';

export const Toaster = () => {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        duration: 5000
      }}
    >
      {(t) => (
        <Box
          role={t.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          sx={{
            ...styles.toastContainer,
            ...(t.type === 'success' ? styles.success : styles.error),
            animation: t.visible ? `${slideIn} 0.3s linear forwards` : `${slideOut} 0.3s linear forwards`
          }}
        >
          <Box sx={styles.contentWrapper}>
            {t.type === 'success' ? (
              <Box sx={styles.icon} data-testid="success-icon">
                <ToastSuccess />
              </Box>
            ) : (
              <Box sx={styles.icon} data-testid="error-icon">
                <ToastError />
              </Box>
            )}

            <Typography sx={styles.message}>{resolveValue(t.message, t)}</Typography>
          </Box>

          <IconButton
            data-testid="close-button"
            aria-label="Close toast"
            onClick={() => toast.dismiss(t.id)}
            sx={styles.closeButton}
          >
            <ToastClose />
          </IconButton>
        </Box>
      )}
    </HotToaster>
  );
};
