import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';

import LoginPage from './page';
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

const submitFormHelper = () => {
  render(<LoginPage />);

  const emailInput = screen.getByLabelText(/Логін/i);
  const passwordInput = screen.getByLabelText(/Пароль/i);
  const submitButton = screen.getByRole('button', { name: 'Увійти' });

  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });
  fireEvent.click(submitButton);
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseLoginMutation.mockReturnValue([jest.fn(), { loading: false, error: undefined }]);
  });

  it('should render the login modal with all fields and button', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/Логін/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Увійти' })).toBeInTheDocument();
  });

  it('should call the mutation on form submission with correct data', () => {
    const mockLoginFn = jest.fn();
    mockedUseLoginMutation.mockReturnValue([mockLoginFn, { loading: false }]);

    submitFormHelper();

    expect(mockLoginFn).toHaveBeenCalledWith({
      variables: {
        email: 'test@example.com',
        password: process.env.TEST_ADMIN_PASSWORD
      }
    });
  });

  it('should handle successful login and redirect', () => {
    mockedUseLoginMutation.mockImplementation(({ onCompleted }) => mockLoginWithSuccess(onCompleted));

    submitFormHelper();

    expect(routerMockPush).toHaveBeenCalledWith('/');
  });

  it('should handle login failure and display error message', () => {
    mockedUseLoginMutation.mockImplementation(({ onCompleted }) => mockLoginWithError(onCompleted));

    submitFormHelper();

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('should handle unexpected errors gracefully', () => {
    mockedUseLoginMutation.mockImplementation(({ onError }) => mockLoginWithNetworkError(onError));

    submitFormHelper();

    expect(screen.getByText('Непередбачена помилка. Спробуйте ще раз.')).toBeInTheDocument();
  });
});
