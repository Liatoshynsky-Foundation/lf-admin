import { render, screen } from '@testing-library/react';
import React from 'react';

import MainPagesPage from './page';

jest.mock('./MainPageContent', () => ({
  MainPagesContent: ({ activeTab }: { activeTab: string }) => (
    <div data-testid="mock-content">Passed tab: {activeTab}</div>
  )
}));

describe('MainPagesPage', () => {
  it('renders foundation tab by default when searchParams is empty', async () => {
    const ui = await MainPagesPage({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.getByTestId('mock-content')).toHaveTextContent('Passed tab: foundation');
  });

  it('passes the correct tab from searchParams when provided as a string', async () => {
    const ui = await MainPagesPage({ searchParams: Promise.resolve({ tab: 'all' }) });
    render(ui);

    expect(screen.getByTestId('mock-content')).toHaveTextContent('Passed tab: all');
  });

  it('falls back to foundation tab if searchParams.tab is an array', async () => {
    const ui = await MainPagesPage({
      searchParams: Promise.resolve({ tab: ['all', 'foundation'] })
    });
    render(ui);

    expect(screen.getByTestId('mock-content')).toHaveTextContent('Passed tab: foundation');
  });
});
