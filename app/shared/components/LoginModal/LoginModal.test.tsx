import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import LoginModal from './LoginModal';

jest.mock('~/public/icons/logo.svg', () => {
  const Logo = () => <img alt="logo" />;
  Logo.displayName = 'Logo';
  return Logo;
});

jest.mock('~/public/icons/eye.svg', () => {
  const Eye = () => <span>eye</span>;
  Eye.displayName = 'Eye';
  return Eye;
});

jest.mock('~/public/icons/eye-closed.svg', () => {
  const EyeClosed = () => <span>closed eye</span>;
  EyeClosed.displayName = 'EyeClosed';
  return EyeClosed;
});

describe('LoginModal', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders all elements correctly', () => {
    render(<LoginModal onSubmit={mockOnSubmit} />);

    expect(screen.getByAltText('logo')).toBeInTheDocument();
    expect(screen.getByText('Вхід до адмін-панелі')).toBeInTheDocument();
    expect(screen.getByText('Для редагування сайту увійдіть у свій обліковий запис.')).toBeInTheDocument();
    expect(screen.getByLabelText('Логін')).toBeInTheDocument();
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Увійти' })).toBeInTheDocument();
  });

  it('shows an error when the username is empty', () => {
    render(<LoginModal onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: 'Увійти' });
    fireEvent.click(submitButton);

    expect(screen.getByText('Логін не може бути порожнім')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows an error when the password is empty', () => {
    render(<LoginModal onSubmit={mockOnSubmit} />);

    const usernameInput = screen.getByLabelText('Логін');
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });

    const submitButton = screen.getByRole('button', { name: 'Увійти' });
    fireEvent.click(submitButton);

    expect(screen.getByText('Пароль не може бути порожнім')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with correct data when inputs are valid', () => {
    render(<LoginModal onSubmit={mockOnSubmit} />);

    const usernameInput = screen.getByLabelText('Логін');
    const passwordInput = screen.getByLabelText('Пароль');
    const submitButton = screen.getByRole('button', { name: 'Увійти' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      login: 'testuser',
      password: 'password123' // NOSONAR
    });
  });
});
