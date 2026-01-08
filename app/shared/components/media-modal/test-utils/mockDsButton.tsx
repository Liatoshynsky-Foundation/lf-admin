import React from 'react';

export type DsButtonProps = {
  label?: string;
  children?: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  role?: string;
  tabIndex?: number;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-selected'?: boolean;
  'aria-pressed'?: boolean;
};

export function MockDsButton(props: Readonly<DsButtonProps>): React.JSX.Element {
  const {
    label,
    children,
    startIcon,
    endIcon,
    onClick,
    disabled,
    role,
    tabIndex,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    'aria-selected': ariaSelected,
    'aria-pressed': ariaPressed
  } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      role={role}
      tabIndex={tabIndex}
      data-testid={dataTestId}
      aria-label={ariaLabel}
      aria-selected={ariaSelected}
      aria-pressed={ariaPressed}
    >
      {startIcon}
      {label ?? children}
      {endIcon}
    </button>
  );
}
