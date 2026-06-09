import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

import LoginPage from './page';
import { loginErrors } from '~/constants/errors';
import { type LoginMutation, useLoginMutation } from '~/types/graphql/generated/graphql';

const mockSuccessMutationResponse: LoginMutation = {
  login: {
    __typename: 'LoginPayload',
    success: true,
    adminId: '123',
    adminType: 'superadmin'
  }
};

const mockErrorMutationResponse: LoginMutation = {
  login: {
    __typename: 'ErrorPayload',
    success: false,
    message: 'Invalid credentials',
    statusCode: 401
  }
};

const mockedUseLoginMutation = useLoginMutation as jest.Mock;
const routerMockPush = jest.fn();

jest.mock('~/types/graphql/generated/graphql', () => ({
  useLoginMutation: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerMockPush
  })
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
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

const mockLoginWithSuccess = (onCompleted: (data: LoginMutation) => void) => {
  const mockLoginFn = jest.fn().mockImplementation(() => {
    act(() => onCompleted(mockSuccessMutationResponse));
  });
  return [mockLoginFn, { loading: false }];
};

const mockLoginWithError = (onCompleted: (data: LoginMutation) => void) => {
  const mockLoginFn = jest.fn().mockImplementation(() => {
    act(() => onCompleted(mockErrorMutationResponse));
  });
  return [mockLoginFn, { loading: false }];
};

const mockLoginWithNetworkError = (onError: (err: Error) => void) => {
  const mockLoginFn = jest.fn().mockImplementation(() => {
    act(() => onError(new Error('Network failed')));
  });
  return [mockLoginFn, { loading: false }];
};

const submitFormHelper = (password: string) => {
  render(<LoginPage />);

  const emailInput = screen.getByLabelText(/Електронна пошта/i);
  const passwordInput = screen.getByLabelText(/Пароль/i);
  const submitButton = screen.getByRole('button', { name: 'Увійти' });

  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.change(passwordInput, { target: { value: password } });
  fireEvent.click(submitButton);
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseLoginMutation.mockReturnValue([jest.fn(), { loading: false, error: undefined }]);
  });

  it('should render the login modal with all fields and button', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/Електронна пошта/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Увійти' })).toBeInTheDocument();
  });

  it('should call the mutation on form submission with correct data', () => {
    const mockLoginFn = jest.fn();
    const test = uuidv4();
    mockedUseLoginMutation.mockReturnValue([mockLoginFn, { loading: false }]);

    submitFormHelper(test);

    expect(mockLoginFn).toHaveBeenCalledWith({
      variables: {
        email: 'test@example.com',
        password: test
      }
    });
  });

  it('should handle successful login and redirect', async () => {
    mockedUseLoginMutation.mockImplementation(({ onCompleted }) => mockLoginWithSuccess(onCompleted));
    const test = uuidv4();

    submitFormHelper(test);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Ви успішно увійшли до адмін панелі!');
      expect(routerMockPush).toHaveBeenCalledWith('/');
    });
  });

  it('should handle login failure and display error message', async () => {
    mockedUseLoginMutation.mockImplementation(({ onCompleted }) => mockLoginWithError(onCompleted));
    const test = uuidv4();

    submitFormHelper(test);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(loginErrors.INVALID_CREDENTIALS || 'Invalid credentials');
    });
  });

  it('should handle unexpected errors gracefully', async () => {
    mockedUseLoginMutation.mockImplementation(({ onError }) => mockLoginWithNetworkError(onError));
    const test = uuidv4();

    submitFormHelper(test);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(loginErrors.UNEXPECTED_ERROR);
    });
  });
});
