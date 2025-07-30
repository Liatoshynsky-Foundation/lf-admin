import { fireEvent, render, screen } from '@testing-library/react';

import LoginPage from './page';
import { type LoginMutationResponse } from '~/types/graphql/adminLogin';

const mockSuccessMutationResponse: LoginMutationResponse = {
  login: {
    __typename: 'LoginPayload',
    success: true,
    adminId: '123',
    adminType: 'superadmin'
  }
};

const mockErrorMutationResponse: LoginMutationResponse = {
  login: {
    __typename: 'ErrorPayload',
    success: false,
    message: 'Invalid credentials',
    statusCode: 401
  }
};

const graphqlHookMock = jest.fn();
const routerMockPush = jest.fn();
const mockMutate = jest.fn();

jest.mock('~/shared/hooks/use-graphql/use-graphql-mutation/useGraphqlMutation', () => ({
  useGraphqlMutation: () => graphqlHookMock()
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

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    graphqlHookMock.mockReturnValue({
      mutate: mockMutate
    });
  });

  it('should render the login modal with all fields and button', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/Логін/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Увійти' })).toBeInTheDocument();
  });

  it('should call the mutation on form submission with correct data', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Логін/i);
    const passwordInput = screen.getByLabelText(/Пароль/i);
    const submitButton = screen.getByRole('button', { name: 'Увійти' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith(
      { email: 'test@example.com', password: 'password123' }, //NOSONAR
      expect.any(Object)
    );
  });

  it('should handle successful login and redirect', () => {
    graphqlHookMock.mockReturnValue({
      mutate: (
        _variables: { email: string; password: string },
        { onSettled }: { onSettled: (response: LoginMutationResponse) => void }
      ) => onSettled(mockSuccessMutationResponse)
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Логін/i);
    const passwordInput = screen.getByLabelText(/Пароль/i);
    const submitButton = screen.getByRole('button', { name: 'Увійти' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(routerMockPush).toHaveBeenCalledWith('/');
  });

  it('should handle login failure and display error message', () => {
    graphqlHookMock.mockReturnValue({
      mutate: (
        _variables: { email: string; password: string },
        { onSettled }: { onSettled: (response: LoginMutationResponse) => void }
      ) => onSettled(mockErrorMutationResponse)
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Логін/i);
    const passwordInput = screen.getByLabelText(/Пароль/i);
    const submitButton = screen.getByRole('button', { name: 'Увійти' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('should handle unexpected errors gracefully', () => {
    graphqlHookMock.mockReturnValue({
      mutate: (
        _variables: { email: string; password: string },
        { onSettled }: { onSettled: (response: LoginMutationResponse | null) => void }
      ) => onSettled(null)
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Логін/i);
    const passwordInput = screen.getByLabelText(/Пароль/i);
    const submitButton = screen.getByRole('button', { name: 'Увійти' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Непередбачена помилка. Спробуйте ще раз.')).toBeInTheDocument();
  });
});
