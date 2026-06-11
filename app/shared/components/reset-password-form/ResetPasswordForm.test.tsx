import { fireEvent,render, screen } from '@testing-library/react';

import ResetPasswordForm from './ResetPasswordForm';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

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

describe('ResetPasswordForm', () => {
  it('shows error if passwords do not match', () => {
    render(<ResetPasswordForm token="" />);

    const newPasswordInput = screen.getByPlaceholderText('Введіть новий пароль');
    const confirmPasswordInput = screen.getByPlaceholderText('Повторіть пароль');
    const submitButton = screen.getByRole('button', { name: /змінити пароль/i });

    fireEvent.change(newPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password456!' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Паролі не збігаються')).toBeInTheDocument();
  });

  it('shows error if password is too short', () => {
    render(<ResetPasswordForm token="" />);

    const newPasswordInput = screen.getByPlaceholderText('Введіть новий пароль');
    const submitButton = screen.getByRole('button', { name: /змінити пароль/i });

    fireEvent.change(newPasswordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Пароль не відповідає вимогам безпеки')).toBeInTheDocument();
  });
});
