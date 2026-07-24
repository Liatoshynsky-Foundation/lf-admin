import { act, fireEvent, render, screen } from '@testing-library/react';
import toast from 'react-hot-toast';

import ForgotPasswordForm from './ForgotPasswordForm';
import { useRequestPasswordResetMutation } from '~/types/graphql/generated/graphql';

const mockMutate = jest.fn();

jest.mock('~/types/graphql/generated/graphql', () => ({
  useRequestPasswordResetMutation: jest.fn()
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() }
}));

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    mockMutate.mockClear();
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
    (useRequestPasswordResetMutation as jest.Mock).mockReturnValue([mockMutate, { loading: false }]);
  });

  it('shows error for invalid email format', () => {
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByPlaceholderText('Введіть електронну пошту'), {
      target: { value: 'invalid-email' }
    });
    fireEvent.click(screen.getByRole('button', { name: /надіслати інструкції/i }));

    expect(screen.getByText('Введіть коректну електронну пошту')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('removes error when user starts typing again', () => {
    render(<ForgotPasswordForm />);
    const emailInput = screen.getByPlaceholderText('Введіть електронну пошту');

    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.click(screen.getByRole('button', { name: /надіслати інструкції/i }));
    expect(screen.getByText('Введіть коректну електронну пошту')).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: 'valid@mail.com' } });
    expect(screen.queryByText('Введіть коректну електронну пошту')).not.toBeInTheDocument();
  });

  it('calls mutation with correct email when form is valid', () => {
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByPlaceholderText('Введіть електронну пошту'), {
      target: { value: 'admin@example.com' }
    });
    fireEvent.click(screen.getByRole('button', { name: /надіслати інструкції/i }));

    expect(mockMutate).toHaveBeenCalledWith({ variables: { email: 'admin@example.com' } });
  });

  it('does not call mutation when email is empty', () => {
    render(<ForgotPasswordForm />);
    fireEvent.click(screen.getByRole('button', { name: /надіслати інструкції/i }));

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('calls toast.success and shows confirmation message on onCompleted', () => {
    let capturedOnCompleted: (() => void) | undefined;
    (useRequestPasswordResetMutation as jest.Mock).mockImplementation((options) => {
      capturedOnCompleted = options.onCompleted;
      return [mockMutate, { loading: false }];
    });

    render(<ForgotPasswordForm />);
    act(() => {
      capturedOnCompleted!();
    });

    expect(toast.success).toHaveBeenCalledWith('Лист для відновлення надіслано');
    expect(screen.getByText(/Якщо обліковий запис із цією електронною адресою існує/)).toBeInTheDocument();
  });

  it('calls toast.error on onError', () => {
    let capturedOnError: (() => void) | undefined;
    (useRequestPasswordResetMutation as jest.Mock).mockImplementation((options) => {
      capturedOnError = options.onError;
      return [mockMutate, { loading: false }];
    });

    render(<ForgotPasswordForm />);
    act(() => {
      capturedOnError!();
    });

    expect(toast.error).toHaveBeenCalledWith('Сталася помилка. Спробуйте ще раз.');
  });

  it('renders loading state correctly when mutation is loading', () => {
    (useRequestPasswordResetMutation as jest.Mock).mockReturnValue([mockMutate, { loading: true }]);

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByRole('button', { name: /надсилання\.\.\./i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});
