import { fireEvent, render, screen } from '@testing-library/react';

import LoginModal from './LoginModal';
import { loginErrors } from '~/constants/errors';

jest.mock('next/link', () => {
  const MockedLink = ({ children, href, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <a href={href || '/'} {...props}>
      {children}
    </a>
  );
  MockedLink.displayName = 'MockedLink';
  return MockedLink;
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
    jest.clearAllMocks();
  });

  it('renders all inputs and buttons', () => {
    render(<LoginModal onSubmit={mockOnSubmit} submitError={null} loading={false} />);
    expect(screen.getByPlaceholderText('Введіть електронну пошту')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введіть пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /увійти/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty fields', () => {
    render(<LoginModal onSubmit={mockOnSubmit} submitError={null} loading={false} />);

    const submitButton = screen.getByRole('button', { name: /увійти/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(loginErrors.EMPTY_EMAIL)).toBeInTheDocument();
    expect(screen.getByText(loginErrors.EMPTY_PASSWORD)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with correct data when form is valid', () => {
    render(<LoginModal onSubmit={mockOnSubmit} submitError={null} loading={false} />);

    const emailInput = screen.getByPlaceholderText('Введіть електронну пошту');
    const passwordInput = screen.getByPlaceholderText('Введіть пароль');
    const submitButton = screen.getByRole('button', { name: /увійти/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      login: 'test@example.com',
      password: 'password123'
    });
  });

  it('clears password field when submitError changes', () => {
    const { rerender } = render(<LoginModal onSubmit={mockOnSubmit} submitError={null} loading={false} />);

    const passwordInput = screen.getByPlaceholderText('Введіть пароль');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(passwordInput).toHaveValue('password123');

    rerender(<LoginModal onSubmit={mockOnSubmit} submitError={Date.now().toString()} />);

    expect(passwordInput).toHaveValue('');
  });
});
