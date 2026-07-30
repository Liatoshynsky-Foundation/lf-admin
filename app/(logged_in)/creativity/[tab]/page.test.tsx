import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

import WorksTabPage from './page';

const mockNotFound = jest.fn(() => {
  throw new Error('notFound');
});

jest.mock('next/navigation', () => ({
  notFound: () => mockNotFound()
}));

jest.mock('../page.styles', () => ({
  styles: {
    pageContainer: {
      padding: 2
    }
  }
}));

jest.mock('../WorksPageContent', () => ({
  WorksPageContent: ({ activeTab }: { activeTab: string }) => <div data-testid="works-page-content">{activeTab}</div>
}));

describe('WorksTabPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the compositions page content for a supported tab', async () => {
    const result = await WorksTabPage({ params: Promise.resolve({ tab: 'compositions' }) });

    render(result as React.ReactElement);

    expect(mockNotFound).not.toHaveBeenCalled();
    expect(screen.getByTestId('works-page-content')).toHaveTextContent('compositions');
  });

  it('calls notFound for an unsupported tab', async () => {
    await expect(WorksTabPage({ params: Promise.resolve({ tab: 'unknown' }) })).rejects.toThrow('notFound');

    expect(mockNotFound).toHaveBeenCalledTimes(1);
  });
});
