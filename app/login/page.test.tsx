import { fireEvent, render, screen } from '@testing-library/react';

import LoginPage from './page';
import { useGraphqlMutation } from '~/shared/hooks/use-graphql/use-graphql-mutation/useGraphqlMutation';

jest.mock('~/shared/hooks/use-graphql/use-graphql-mutation/useGraphqlMutation');

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
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useGraphqlMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate
    });
  });

  it('should render the login modal', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/Логін/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Увійти' })).toBeInTheDocument();
  });

  it('should call the mutation on form submission', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Логін/i);
    const passwordInput = screen.getByLabelText(/Пароль/i);
    const submitButton = screen.getByRole('button', { name: 'Увійти' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' }, expect.any(Object));
  });

  it.skip('should handle successful login', () => {
    const mockOnSuccess = jest.fn();
    (useGraphqlMutation as jest.Mock).mockReturnValue({
      mutate: ({ onSuccess }: any) => onSuccess({ login: { success: true } })
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Логін/i);
    const passwordInput = screen.getByLabelText(/Пароль/i);
    const submitButton = screen.getByRole('button', { name: 'Увійти' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockOnSuccess).toHaveBeenCalledWith({ login: { success: true } });
  });

  it.skip('should handle login failure', () => {
    const mockOnError = jest.fn();
    (useGraphqlMutation as jest.Mock).mockReturnValue({
      mutate: ({ onError }: any) => onError(new Error('Login failed'))
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Логін/i);
    const passwordInput = screen.getByLabelText(/Пароль/i);
    const submitButton = screen.getByRole('button', { name: 'Увійти' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockOnError).toHaveBeenCalledWith(new Error('Login failed'));
  });
});
