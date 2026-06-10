import { fireEvent,render, screen } from '@testing-library/react';

import ForgotPasswordForm from './ForgotPasswordForm';

describe('ForgotPasswordForm', () => {
  it('shows error for invalid email format', () => {
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText('Введіть електронну пошту');
    const submitButton = screen.getByRole('button', { name: /надіслати інструкції/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Введіть коректну електронну пошту')).toBeInTheDocument();
  });

  it('removes error when user starts typing again', () => {
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText('Введіть електронну пошту');
    const submitButton = screen.getByRole('button', { name: /надіслати інструкції/i });

    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.click(submitButton);
    expect(screen.getByText('Введіть коректну електронну пошту')).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: 'valid@mail.com' } });
    expect(screen.queryByText('Введіть коректну електронну пошту')).not.toBeInTheDocument();
  });
});
