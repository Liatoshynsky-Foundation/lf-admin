import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import ResetPasswordForm from './ResetPasswordForm';
import { resetPasswordErrors } from '~/constants/errors';
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

interface SuccessPayload {
  resetPassword: {
    __typename: 'SuccessPayload';
  };
}

interface ErrorPayload {
  resetPassword: {
    __typename: 'ErrorPayload';
    message: string;
  };
}

interface GraphQLErrorResponse {
  graphQLErrors: Array<{ message: string }>;
}

describe('ResetPasswordForm', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useResetPasswordMutation as jest.Mock).mockReturnValue([mockMutate, { loading: false }]);
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('shows error if password is empty or only spaces', () => {
    render(<ResetPasswordForm token="valid-token" />);
    fireEvent.change(screen.getByPlaceholderText('Введіть новий пароль'), {
      target: { value: '   ' }
    });
    fireEvent.click(screen.getByRole('button', { name: /змінити пароль/i }));

    expect(screen.getByText(resetPasswordErrors.EMPTY_PASSWORD)).toBeInTheDocument();
  });

  it('shows error if password is too short', () => {
    render(<ResetPasswordForm token="valid-token" />);
    fireEvent.change(screen.getByPlaceholderText('Введіть новий пароль'), {
      target: { value: 'Short1!' }
    });
    fireEvent.click(screen.getByRole('button', { name: /змінити пароль/i }));

    expect(screen.getByText(resetPasswordErrors.REQUIREMENTS_NOT_MET)).toBeInTheDocument();
  });

  it('shows error if password exceeds 72 characters', () => {
    render(<ResetPasswordForm token="valid-token" />);
    fireEvent.change(screen.getByPlaceholderText('Введіть новий пароль'), {
      target: { value: 'LongPassword1!'.repeat(10) }
    });
    fireEvent.click(screen.getByRole('button', { name: /змінити пароль/i }));

    expect(screen.getByText(resetPasswordErrors.REQUIREMENTS_NOT_MET)).toBeInTheDocument();
  });

  it('shows error if password does not meet regex requirements', () => {
    render(<ResetPasswordForm token="valid-token" />);
    fireEvent.change(screen.getByPlaceholderText('Введіть новий пароль'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /змінити пароль/i }));

    expect(screen.getByText(resetPasswordErrors.REQUIREMENTS_NOT_MET)).toBeInTheDocument();
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

    expect(screen.getByText(resetPasswordErrors.PASSWORDS_MISMATCH)).toBeInTheDocument();
  });

  it('shows error if confirm password is empty', () => {
    render(<ResetPasswordForm token="valid-token" />);
    fireEvent.change(screen.getByPlaceholderText('Введіть новий пароль'), {
      target: { value: 'Password123!' }
    });
    fireEvent.click(screen.getByRole('button', { name: /змінити пароль/i }));

    expect(screen.getByText('Підтвердіть пароль')).toBeInTheDocument();
  });

  it('clears errors when user changes inputs', () => {
    render(<ResetPasswordForm token="valid-token" />);
    fireEvent.click(screen.getByRole('button', { name: /змінити пароль/i }));

    const passwordInput = screen.getByPlaceholderText('Введіть новий пароль');
    const confirmInput = screen.getByPlaceholderText('Повторіть пароль');

    fireEvent.change(passwordInput, { target: { value: 'a' } });
    fireEvent.change(confirmInput, { target: { value: 'a' } });

    expect(screen.queryByText(resetPasswordErrors.EMPTY_PASSWORD)).not.toBeInTheDocument();
    expect(screen.queryByText('Підтвердіть пароль')).not.toBeInTheDocument();
  });

  it('shows loading state on the submit button', () => {
    (useResetPasswordMutation as jest.Mock).mockReturnValue([mockMutate, { loading: true }]);
    render(<ResetPasswordForm token="valid-token" />);

    const submitBtn = screen.getByRole('button', { name: /Збереження.../i });
    expect(submitBtn).toBeDisabled();
  });

  it('calls toast.success and navigates on SuccessPayload', () => {
    let capturedOnCompleted: ((data: SuccessPayload) => void) | undefined;
    (useResetPasswordMutation as jest.Mock).mockImplementation(
      (options: { onCompleted: (data: SuccessPayload) => void }) => {
        capturedOnCompleted = options.onCompleted;
        return [mockMutate, { loading: false }];
      }
    );

    render(<ResetPasswordForm token="valid-token" />);
    act(() => {
      capturedOnCompleted?.({ resetPassword: { __typename: 'SuccessPayload' } });
    });

    expect(toast.success).toHaveBeenCalledWith('Пароль успішно змінено. Увійдіть з новим паролем.');
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('calls toast.error on ErrorPayload', () => {
    let capturedOnCompleted: ((data: ErrorPayload) => void) | undefined;
    (useResetPasswordMutation as jest.Mock).mockImplementation(
      (options: { onCompleted: (data: ErrorPayload) => void }) => {
        capturedOnCompleted = options.onCompleted;
        return [mockMutate, { loading: false }];
      }
    );

    render(<ResetPasswordForm token="valid-token" />);
    act(() => {
      capturedOnCompleted?.({
        resetPassword: { __typename: 'ErrorPayload', message: 'Token invalid' }
      });
    });

    expect(toast.error).toHaveBeenCalledWith('Token invalid');
  });

  it('handles mutation errors with fallback message', () => {
    let capturedOnError: ((error: GraphQLErrorResponse) => void) | undefined;
    (useResetPasswordMutation as jest.Mock).mockImplementation(
      (options: { onError: (error: GraphQLErrorResponse) => void }) => {
        capturedOnError = options.onError;
        return [mockMutate, { loading: false }];
      }
    );

    render(<ResetPasswordForm token="valid-token" />);

    act(() => {
      capturedOnError?.({ graphQLErrors: [{ message: 'Server Error' }] });
    });
    expect(toast.error).toHaveBeenCalledWith('Server Error');

    act(() => {
      capturedOnError?.({ graphQLErrors: [] });
    });
    expect(toast.error).toHaveBeenCalledWith('Сталася помилка, спробуйте ще раз');
  });

  it('should call resetPasswordMutation when form is valid and submitted', () => {
    render(<ResetPasswordForm token="test-token" />);

    fireEvent.change(screen.getByPlaceholderText('Введіть новий пароль'), {
      target: { value: 'ValidPass123!' }
    });
    fireEvent.change(screen.getByPlaceholderText('Повторіть пароль'), {
      target: { value: 'ValidPass123!' }
    });

    fireEvent.submit(screen.getByRole('button', { name: /змінити пароль/i }).closest('form')!);

    expect(mockMutate).toHaveBeenCalledWith({
      variables: { token: 'test-token', password: 'ValidPass123!' }
    });
  });

  it('should clear confirm password error when user types in confirm field', () => {
    render(<ResetPasswordForm token="token" />);
    const confirmInput = screen.getByPlaceholderText('Повторіть пароль');

    fireEvent.click(screen.getByRole('button', { name: /змінити пароль/i }));
    expect(screen.getByText('Підтвердіть пароль')).toBeInTheDocument();

    fireEvent.change(confirmInput, { target: { value: 'a' } });
    expect(screen.queryByText('Підтвердіть пароль')).not.toBeInTheDocument();
  });

  it('should handle onCompleted when __typename is not handled', () => {
    let capturedOnCompleted: ((data: { resetPassword: { __typename: string } }) => void) | undefined;
    (useResetPasswordMutation as jest.Mock).mockImplementation((options) => {
      capturedOnCompleted = options.onCompleted;
      return [mockMutate, { loading: false }];
    });

    render(<ResetPasswordForm token="token" />);
    act(() => {
      capturedOnCompleted?.({ resetPassword: { __typename: 'UnknownPayload' } });
    });

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
