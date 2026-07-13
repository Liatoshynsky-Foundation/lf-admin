import { render, screen } from '@testing-library/react';

import ArchiveTabPage from './page';
import { ARCHIVE_TABS } from '~/constants/archive';

const mockNotFound = jest.fn(() => {
  throw new Error('notFound');
});

jest.mock('next/navigation', () => ({
  notFound: () => mockNotFound()
}));

jest.mock('../(componets)/ArchivePageContent', () => ({
  __esModule: true,
  ArchivePageContent: ({ activeTab }: { activeTab: string }) => (
    <div data-testid="archive-page-content-mock">
      <span data-testid="active-tab-mock">{activeTab}</span>
    </div>
  )
}));

describe('ArchiveTabPage', () => {
  it('renders ArchivePageContent with correct activeTab if it is valid', async () => {
    const ui = await ArchiveTabPage({ params: Promise.resolve({ tab: ARCHIVE_TABS[1].value }) });
    render(ui);

    const container = screen.getByTestId('archive-page-content-mock');
    expect(container).toBeInTheDocument();

    const tabSpan = screen.getByTestId('active-tab-mock');
    expect(tabSpan).toHaveTextContent('fonds');
  });

  it('should return notFound page if activeTab is invalid', async () => {
    await expect(ArchiveTabPage({ params: Promise.resolve({ tab: 'invalid' }) })).rejects.toThrow('notFound');
   
    expect(mockNotFound).toHaveBeenCalledTimes(1);
  });
});
