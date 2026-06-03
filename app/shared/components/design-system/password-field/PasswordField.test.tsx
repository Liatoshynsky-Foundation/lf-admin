import { fireEvent,render, screen } from '@testing-library/react';

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
    expect(screen.getByLabelText('Пароль *')).toBeInTheDocument();
  });

  it('renders helper text when provided', () => {
    render(<PasswordField helperText="Обов'язкове поле" />);
    expect(screen.getByText('Обов\'язкове поле')).toBeInTheDocument();
  });

  it('toggles password visibility when the visibility button is clicked', () => {
    render(<PasswordField helperText={null} />);

    const passwordInput = screen.getByLabelText('Пароль *');
    const toggleButton = screen.getByRole('button', { name: /display the password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: /hide the password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('renders with custom label if provided', () => {
    render(<PasswordField label="Новий пароль *" helperText={null} />);
    expect(screen.getByLabelText('Новий пароль *')).toBeInTheDocument();
  });
});
