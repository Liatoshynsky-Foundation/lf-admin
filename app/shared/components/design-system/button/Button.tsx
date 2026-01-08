'use client';

import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { forwardRef, type ReactNode } from 'react';

import { buttonBaseStyles, sizeStyles, typographyStyles, variantStyles } from './Button.styles';
import { sxToArray } from '~/lib/utils/sxToArray';

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

    const visualSx = color === 'tertiary' ? variantStyles.tertiary.filled : variantStyles[color][variant];

    const mergedSx: MuiButtonProps['sx'] = [
      buttonBaseStyles,
      sizeStyles[size],
      typographyStyles[color][size],
      visualSx,
      ...sxToArray(sx)
    ];

    return (
      <MuiButton
        ref={ref}
        size={size}
        variant={muiVariant}
        disabled={isDisabled}
        startIcon={!loading ? startIcon : undefined}
        endIcon={!loading ? endIcon : undefined}
        sx={mergedSx}
        {...props}
      >
        {loading ? <CircularProgress size={25} color="inherit" data-testid="loader" /> : content}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';
export default Button;
