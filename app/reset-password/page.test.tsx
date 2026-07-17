import { render, screen } from '@testing-library/react';

import ResetPasswordPage from './page';

jest.mock('~/shared/components/reset-password-form/ResetPasswordForm', () => ({
  __esModule: true,
  default: function MockedForm({ token }: { token: string }) {
    return <div data-testid="mock-reset-form">Form for token: {token}</div>;
  }
}));

jest.mock('~/shared/components/auth-card/AuthCardLayout', () => ({
  __esModule: true,
  AuthCardLayout: function MockedLayout({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div data-testid="mock-layout">
        <h1>{title}</h1>
        {children}
      </div>
    );
  }
}));

const mockExecute = jest.fn();

jest.mock('~/container/index', () => ({
  createRootContainer: jest.fn(() => ({
    resolve: jest.fn(() => ({ execute: mockExecute }))
  }))
}));

describe('ResetPasswordPage (Server Component)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders error if no token is provided', async () => {
    const UI = await ResetPasswordPage({ searchParams: Promise.resolve({}) });
    render(UI);

    expect(screen.getByText('Помилка')).toBeInTheDocument();
    expect(screen.getByText('Будь ласка, перейдіть за посиланням з вашого листа.')).toBeInTheDocument();
  });

  it('renders the form when token is valid', async () => {
    mockExecute.mockResolvedValue(true);
    const UI = await ResetPasswordPage({ searchParams: Promise.resolve({ token: 'valid-token-123' }) });
    render(UI);

    expect(screen.getByTestId('mock-reset-form')).toHaveTextContent('Form for token: valid-token-123');
  });

  it('renders error if token is expired or already used', async () => {
    mockExecute.mockResolvedValue(false);
    const UI = await ResetPasswordPage({ searchParams: Promise.resolve({ token: 'expired-token' }) });
    render(UI);

    expect(screen.getByText('Помилка')).toBeInTheDocument();
    expect(screen.getByText(/Посилання для відновлення пароля вже було використано/i)).toBeInTheDocument();
  });

  it('renders error if use case throws', async () => {
    mockExecute.mockRejectedValue(new Error('DB error'));
    const UI = await ResetPasswordPage({ searchParams: Promise.resolve({ token: 'some-token' }) });
    render(UI);

    expect(screen.getByText('Помилка')).toBeInTheDocument();
  });
});
