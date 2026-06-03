import { render, screen } from '@testing-library/react';

import ResetPasswordPage from './page';

jest.mock('~/shared/components/reset-password-form/ResetPasswordForm', () => {
  return {
    __esModule: true,
    default: function MockedForm({ token }: { token: string }) {
      return <div data-testid="mock-reset-form">Form for token: {token}</div>;
    }
  };
});

jest.mock('~/shared/components/auth-card/AuthCardLayout', () => {
  return {
    __esModule: true,
    AuthCardLayout: function MockedLayout({ title, children }: { title: string; children: React.ReactNode }) {
      return (
        <div data-testid="mock-layout">
          <h1>{title}</h1>
          {children}
        </div>
      );
    }
  };
});

describe('ResetPasswordPage (Server Component)', () => {
  it('renders error if no token is provided', async () => {
    const searchParams = Promise.resolve({});

    const UI = await ResetPasswordPage({ searchParams });
    render(UI);

    expect(screen.getByText('Помилка')).toBeInTheDocument();
    expect(screen.getByText('Будь ласка, перейдіть за посиланням з вашого листа.')).toBeInTheDocument();
  });

  it('renders the form when token is provided', async () => {
    const searchParams = Promise.resolve({ token: 'valid-token-123' });

    const UI = await ResetPasswordPage({ searchParams });
    render(UI);

    expect(screen.getByTestId('mock-reset-form')).toHaveTextContent('Form for token: valid-token-123');
  });

  it('renders error if token is invalid', async () => {
    const searchParams = Promise.resolve({ token: 'invalid-fake-token' });

    const UI = await ResetPasswordPage({ searchParams });
    render(UI);

    expect(screen.getByText('Помилка')).toBeInTheDocument();
    expect(screen.getByText(/Посилання для відновлення пароля вже було використано/i)).toBeInTheDocument();
  });
});
