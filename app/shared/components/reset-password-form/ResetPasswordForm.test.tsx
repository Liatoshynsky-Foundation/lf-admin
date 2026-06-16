import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import ResetPasswordForm from './ResetPasswordForm';
import { useResetPasswordMutation } from '~/types/graphql/generated/graphql';

const mockMutate = jest.fn();

jest.mock('~/types/graphql/generated/graphql', () => ({
  useResetPasswordMutation: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() }
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
  const mockPush = jest.fn();

  beforeEach(() => {
    mockMutate.mockClear();
    mockPush.mockClear();
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
    (useResetPasswordMutation as jest.Mock).mockReturnValue([mockMutate, { loading: false }]);
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('shows error if passwords do not match', () => {
    render(<ResetPasswordForm token="valid-token" />);
    fireEvent.change(screen.getByPlaceholderText('Введіть новий пароль'), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByPlaceholderText('Повторіть пароль'), {
      target: { value: 'Password456!' }
    });
    fireEvent.click(screen.getByRole('button', { name: /змінити пароль/i }));

    expect(screen.getByText('Паролі не збігаються.')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows error if password is too short', () => {
    render(<ResetPasswordForm token="valid-token" />);
    fireEvent.change(screen.getByPlaceholderText('Введіть новий пароль'), {
      target: { value: '123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /змінити пароль/i }));

    expect(screen.getByText('Пароль не відповідає вимогам безпеки.')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('calls mutation with correct variables when form is valid', () => {
    render(<ResetPasswordForm token="my-token-abc" />);
    fireEvent.change(screen.getByPlaceholderText('Введіть новий пароль'), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByPlaceholderText('Повторіть пароль'), {
      target: { value: 'Password123!' }
    });
    fireEvent.click(screen.getByRole('button', { name: /змінити пароль/i }));

    expect(mockMutate).toHaveBeenCalledWith({
      variables: { token: 'my-token-abc', password: 'Password123!' }
    });
  });

  it('calls toast.success and navigates to /login on SuccessPayload', () => {
    let capturedOnCompleted: ((data: any) => void) | undefined;
    (useResetPasswordMutation as jest.Mock).mockImplementation((options) => {
      capturedOnCompleted = options.onCompleted;
      return [mockMutate, { loading: false }];
    });

    render(<ResetPasswordForm token="valid-token" />);
    act(() => {
      capturedOnCompleted!({ resetPassword: { __typename: 'SuccessPayload' } });
    });

    expect(toast.success).toHaveBeenCalledWith('Пароль успішно змінено. Увійдіть з новим паролем.');
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('calls toast.error on ErrorPayload', () => {
    let capturedOnCompleted: ((data: any) => void) | undefined;
    (useResetPasswordMutation as jest.Mock).mockImplementation((options) => {
      capturedOnCompleted = options.onCompleted;
      return [mockMutate, { loading: false }];
    });

    render(<ResetPasswordForm token="valid-token" />);
    act(() => {
      capturedOnCompleted!({ resetPassword: { __typename: 'ErrorPayload', message: 'Token expired' } });
    });

    expect(toast.error).toHaveBeenCalledWith('Token expired');
  });

  it('calls toast.error on mutation network error', () => {
    let capturedOnError: ((error: any) => void) | undefined;
    (useResetPasswordMutation as jest.Mock).mockImplementation((options) => {
      capturedOnError = options.onError;
      return [mockMutate, { loading: false }];
    });

    render(<ResetPasswordForm token="valid-token" />);
    act(() => {
      capturedOnError!({ graphQLErrors: [{ message: 'Server error' }] });
    });

    expect(toast.error).toHaveBeenCalledWith('Server error');
  });

  it('calls fallback toast.error if graphQLErrors is empty', () => {
    let capturedOnError: ((error: any) => void) | undefined;
    (useResetPasswordMutation as jest.Mock).mockImplementation((options) => {
      capturedOnError = options.onError;
      return [mockMutate, { loading: false }];
    });

    render(<ResetPasswordForm token="valid-token" />);
    act(() => {
      capturedOnError!({ graphQLErrors: [] });
    });

    expect(toast.error).toHaveBeenCalledWith('Сталася помилка, спробуйте ще раз');
  });
});
