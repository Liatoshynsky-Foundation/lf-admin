import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import PasswordField from './PasswordField';

jest.mock('~/public/icons/eye.svg', () => {
  const Eye = () => <span>VisibilityOn</span>;
  Eye.displayName = 'Eye';
  return Eye;
});

jest.mock('~/public/icons/eye-closed.svg', () => {
  const EyeClosed = () => <span>VisibilityOff</span>;
  EyeClosed.displayName = 'EyeClosed';
  return EyeClosed;
});

describe('PasswordField', () => {
  it('renders the password field with label', () => {
    render(<PasswordField helperText={null} />);
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
  });

  it('renders helper text when provided', () => {
    const helperText = 'Пароль має містити щонайменше 6 символів';
    render(<PasswordField helperText={helperText} />);
    expect(screen.getByText(helperText)).toBeInTheDocument();
  });

  it('does not render helper text when not provided', () => {
    render(<PasswordField helperText={null} />);
    expect(screen.queryByText('Пароль має містити щонайменше 6 символів')).toBeNull();
  });

  it('toggles password visibility when the visibility button is clicked', () => {
    render(<PasswordField helperText={null} />);
    const passwordInput = screen.getByLabelText('Пароль');
    const toggleButton = screen.getByRole('button', { name: 'display the password' });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveAttribute('aria-label', 'hide the password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton).toHaveAttribute('aria-label', 'display the password');
  });
});
