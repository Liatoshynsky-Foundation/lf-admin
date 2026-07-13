import { render, screen } from '@testing-library/react';
import React from 'react';

import ArchivePage from './page';

jest.mock('./(components)/ArchivePageContent', () => ({
  __esModule: true,
  ArchivePageContent: ({ activeTab }: { activeTab: string }) => (
    <div data-testid="archive-page-content-mock">
      <span data-testid="active-tab-mock">{activeTab}</span>
    </div>
  )
}));

describe('ArchivePage', () => {
  it('renders ArchivePageContent with correct default activeTab prop', () => {
    render(<ArchivePage />);

    const container = screen.getByTestId('archive-page-content-mock');
    expect(container).toBeInTheDocument();

    const tabSpan = screen.getByTestId('active-tab-mock');
    expect(tabSpan).toHaveTextContent('all');
  });
});
