'use client';

import { Box, IconButton, Typography } from '@mui/material';
import { CheckCircle2, CircleAlert,X } from 'lucide-react';
import { resolveValue, toast, Toaster as HotToaster } from 'react-hot-toast';

import { slideIn, slideOut, styles } from './Toaster.styles';

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
                <CheckCircle2 size={32} color="#696C7D" />
              </Box>
            ) : (
              <Box sx={styles.icon} data-testid="error-icon">
                <CircleAlert size={32} color="#696C7D" />
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
            <X size={22} strokeWidth={1.25} />
          </IconButton>
        </Box>
      )}
    </HotToaster>
  );
};
