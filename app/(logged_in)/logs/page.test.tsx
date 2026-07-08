import { render, screen } from '@testing-library/react';

import LogsPage from './page';

jest.mock('./LogsPageClient', () => {
  return function MockLogsPageClient() {
    return <div data-testid="mock-logs-page-client" />;
  };
});

describe('LogsPage', () => {
  it('renders LogsPageClient inside the layout wrapper', () => {
    render(<LogsPage />);

    expect(screen.getByTestId('mock-logs-page-client')).toBeInTheDocument();
  });
});
