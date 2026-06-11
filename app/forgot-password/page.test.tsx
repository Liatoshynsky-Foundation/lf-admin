import { render, screen } from '@testing-library/react';

import ForgotPasswordPage from './page';

jest.mock('~/shared/components/forgot-password-form/ForgotPasswordForm', () => {
  return function MockedForm() {
    return <div data-testid="mock-forgot-form">Mock Form</div>;
  };
});

describe('ForgotPasswordPage', () => {
  it('renders the ForgotPasswordForm component', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByTestId('mock-forgot-form')).toBeInTheDocument();
  });
});
