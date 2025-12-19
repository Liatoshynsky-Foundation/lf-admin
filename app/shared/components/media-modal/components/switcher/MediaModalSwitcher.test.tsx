import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { MouseEventHandler, ReactNode, SVGProps } from 'react';

import type { MediaModalTab } from '../../MediaModal.types';
import { MediaModalSwitcher } from './MediaModalSwitcher';

type DsButtonProps = {
  label?: string;
  children?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  role?: string;
  tabIndex?: number;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-selected'?: boolean;
  'aria-pressed'?: boolean;
  disableRipple?: boolean;
  disableFocusRipple?: boolean;
  disableElevation?: boolean;
  sx?: unknown;
  color?: unknown;
  variant?: unknown;
};

jest.mock('~/public/icons/gallery.svg', () => ({
  __esModule: true,
  default: (props: SVGProps<SVGSVGElement>) => <svg {...props} />
}));

jest.mock('~/public/icons/upload.svg', () => ({
  __esModule: true,
  default: (props: SVGProps<SVGSVGElement>) => <svg {...props} />
}));

jest.mock('~/public/icons/fileClock.svg', () => ({
  __esModule: true,
  default: (props: SVGProps<SVGSVGElement>) => <svg {...props} />
}));

jest.mock('~/shared/components/design-system/button/Button', () => ({
  __esModule: true,
  default: (props: DsButtonProps) => {
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
}));

describe('MediaModalSwitcher', () => {
  it('should render 3 tabs and call onChange with correct tab', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn<void, [MediaModalTab]>();

    render(<MediaModalSwitcher value="GALLERY" onChange={onChange} />);

    expect(screen.getByTestId('MediaModalSwitcher')).toHaveAttribute('role', 'tablist');

    expect(screen.getByTestId('MediaModalSwitcher-galleryTab')).toHaveAttribute('role', 'tab');
    expect(screen.getByTestId('MediaModalSwitcher-uploadTab')).toHaveAttribute('role', 'tab');
    expect(screen.getByTestId('MediaModalSwitcher-usedTab')).toHaveAttribute('role', 'tab');

    expect(screen.getByTestId('MediaModalSwitcher-galleryTab')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('MediaModalSwitcher-uploadTab')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByTestId('MediaModalSwitcher-usedTab')).toHaveAttribute('aria-selected', 'false');

    await user.click(screen.getByTestId('MediaModalSwitcher-uploadTab'));
    expect(onChange).toHaveBeenCalledWith('UPLOAD');

    await user.click(screen.getByTestId('MediaModalSwitcher-usedTab'));
    expect(onChange).toHaveBeenCalledWith('USED');
  });

  it('should set correct tabIndex for active/inactive tabs', () => {
    const onChange = jest.fn<void, [MediaModalTab]>();

    render(<MediaModalSwitcher value="USED" onChange={onChange} />);

    expect(screen.getByTestId('MediaModalSwitcher-usedTab')).toHaveAttribute('tabindex', '0');
    expect(screen.getByTestId('MediaModalSwitcher-galleryTab')).toHaveAttribute('tabindex', '-1');
    expect(screen.getByTestId('MediaModalSwitcher-uploadTab')).toHaveAttribute('tabindex', '-1');
  });
});
