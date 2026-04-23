'use client';
import { CheckCircleOutline, CloseRounded, ErrorOutline, InfoOutlined, WarningAmberRounded } from '@mui/icons-material';
import {
  Alert as MuiAlert,
  AlertProps as MuiAlertProps,
  AlertTitle as MuiAlertTitle,
  AlertTitleProps,
  Box
} from '@mui/material';
import { ButtonHTMLAttributes, forwardRef, SyntheticEvent, useCallback } from 'react';

import { alertColors } from '~/shared/theme/colors';

export type AlertColor = 'success' | 'info' | 'warning' | 'error';

export const AlertTitle = ({ children, ...props }: AlertTitleProps) => {
  return <MuiAlertTitle {...props}>{children}</MuiAlertTitle>;
};

AlertTitle.displayName = 'AlertTitle';

interface CloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  onClick?: (event: SyntheticEvent) => void;
  variant?: 'filled' | 'outlined';
}

const CloseButton = ({ label, onClick, variant = 'filled' }: CloseButtonProps) => {
  return (
    <Box
      component="button"
      aria-label="Close alert"
      onClick={onClick}
      sx={{
        typography: 'caption',
        background: 'transparent',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        alignSelf: 'flex-start',
        color: variant === 'outlined' ? alertColors.outlined.label : alertColors.filled.label,

        '& span': {
          margin: '0 12px 0 0'
        },

        '& svg': {
          width: '20px',
          height: '20px',
          color: alertColors.cross
        }
      }}
    >
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
        slots={{
          closeButton: CustomCloseButton
        }}
        {...props}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && (
          <Box component="p" sx={{ margin: 0 }}>
            {description}
          </Box>
        )}
      </MuiAlert>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
