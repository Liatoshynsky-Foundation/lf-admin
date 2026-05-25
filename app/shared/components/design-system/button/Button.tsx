'use client';

import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { forwardRef, type ReactNode } from 'react';

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
    const content = label ?? children;

    const muiVariant: MuiButtonProps['variant'] = (
      { filled: 'contained', outlined: 'outlined', text: 'text' } as const
    )[variant];

    return (
      <MuiButton
        ref={ref}
        size={size}
        color={color}
        variant={muiVariant}
        disabled={isDisabled}
        startIcon={!loading ? startIcon : undefined}
        endIcon={!loading ? endIcon : undefined}
        sx={sx}
        {...props}
      >
        {loading ? <CircularProgress size={25} color="inherit" data-testid="loader" /> : content}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';
export default Button;
