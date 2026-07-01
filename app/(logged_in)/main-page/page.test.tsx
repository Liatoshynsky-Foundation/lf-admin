import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import React from 'react';

import MainPagesTabPage from './[tab]/page';
import MainPagesPage from './page';

jest.mock('next/navigation', () => ({
  notFound: jest.fn()
}));

jest.mock('./MainPageContent', () => ({
  MainPagesContent: ({ activeTab }: { activeTab: string }) => (
    <div data-testid="mock-content">Passed tab: {activeTab}</div>
  )
}));

describe('MainPage Routing & Pages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('root page renders "all" tab by default', async () => {
    const ui = await MainPagesPage();
    render(ui);

    expect(screen.getByTestId('mock-content')).toHaveTextContent('Passed tab: all');
  });

  it('dynamic page renders the correct tab from params', async () => {
    const ui = await MainPagesTabPage({ params: Promise.resolve({ tab: 'all' }) });
    render(ui);

    expect(screen.getByTestId('mock-content')).toHaveTextContent('Passed tab: all');
  });

  it('dynamic page triggers notFound for invalid tab parameters', async () => {
    await MainPagesTabPage({ params: Promise.resolve({ tab: 'some-garbage-route' }) });

    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
