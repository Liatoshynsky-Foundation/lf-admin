'use client';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { forwardRef, ReactNode } from 'react';

import { buttonBaseStyles, sizeStyles, typographyStyles, variantStyles } from './Button.styles';

type Size = 'large' | 'medium' | 'small';
type Variant = 'filled' | 'outlined' | 'text';

type BaseButtonProps = {
  size?: Size;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loading?: boolean;
  label?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
} & (
  | {
      color?: 'primary' | 'secondary';
      variant?: Variant;
    }
  | {
      color: 'tertiary';
      variant?: 'filled';
    }
);

export type ButtonProps = BaseButtonProps & Omit<MuiButtonProps, keyof BaseButtonProps>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      sx,
      size = 'medium',
      variant = 'filled',
      color = 'secondary',
      label,
      disabled,
      loading,
      startIcon,
      endIcon,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = Boolean(disabled) || Boolean(loading);

    const buttonContent = label ?? children;

    return (
      <MuiButton
        ref={ref}
        size={size}
        variant="contained"
        startIcon={!loading ? startIcon : undefined}
        endIcon={!loading ? endIcon : undefined}
        disabled={isDisabled}
        sx={{
          ...buttonBaseStyles,
          ...sizeStyles[size],
          ...typographyStyles[color]?.[size],
          ...(color === 'tertiary' ? variantStyles.tertiary.filled : variantStyles[color]?.[variant]),
          ...(sx as object)
        }}
        {...props}
      >
        {loading ? <CircularProgress size={25} color="inherit" data-testid="loader" /> : buttonContent}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';
export default Button;
