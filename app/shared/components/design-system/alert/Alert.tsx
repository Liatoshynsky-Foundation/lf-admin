'use client';
import { CheckCircleOutline, CloseRounded, ErrorOutline, InfoOutlined, WarningAmberRounded } from '@mui/icons-material';
import {
  Alert as MuiAlert,
  AlertProps as MuiAlertProps,
  AlertTitle as MuiAlertTitle,
  AlertTitleProps,
  Box,
  Typography
} from '@mui/material';
import { ButtonHTMLAttributes, forwardRef, SyntheticEvent, useCallback } from 'react';

import { styles } from './Alert.styles';

export type AlertColor = 'success' | 'info' | 'warning' | 'error';

export const AlertTitle = ({ children, ...props }: AlertTitleProps) => {
  return (
    <MuiAlertTitle sx={styles.title} {...props}>
      <Typography variant="caption">{children}</Typography>
    </MuiAlertTitle>
  );
};

AlertTitle.displayName = 'AlertTitle';

interface CloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  onClick?: (event: SyntheticEvent) => void;
  variant?: 'filled' | 'outlined';
}

const CloseButton = ({ label, onClick, variant = 'filled' }: CloseButtonProps) => {
  return (
    <Box component="button" aria-label="Close alert" onClick={onClick} sx={styles.closeButton(variant)}>
      {label && <Box component="span">{label}</Box>}
      <CloseRounded />
    </Box>
  );
};

CloseButton.displayName = 'CloseButton';

const iconMapping = {
  error: <ErrorOutline />,
  warning: <WarningAmberRounded />,
  info: <InfoOutlined />,
  success: <CheckCircleOutline />
};

export interface AlertProps extends Omit<MuiAlertProps, 'severity'> {
  severity?: AlertColor;
  title?: string;
  description?: string;
  label?: string;
  variant?: 'filled' | 'outlined';
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ title, label, description, icon, onClose, severity = 'info', variant = 'filled', ...props }, ref) => {
    const handleClose = useCallback(
      (event: SyntheticEvent) => {
        onClose?.(event);
      },
      [onClose]
    );

    const combinedStyles = [
      styles.alert,
      styles.getColorStyles(severity, variant),
      {
        '& .MuiAlert-icon': styles.icon(severity, variant),
        '& .MuiAlert-action': styles.action
      }
    ];

    const CustomCloseButton = useCallback(
      () => <CloseButton label={label} onClick={handleClose} variant={variant} />,
      [label, handleClose, variant]
    );

    return (
      <MuiAlert
        icon={icon}
        iconMapping={iconMapping}
        onClose={handleClose}
        ref={ref}
        severity={severity}
        variant={variant}
        sx={combinedStyles}
        slots={{
          closeButton: CustomCloseButton
        }}
        {...props}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && (
          <Typography variant="body1" component="p" sx={styles.description}>
            {description}
          </Typography>
        )}
      </MuiAlert>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
