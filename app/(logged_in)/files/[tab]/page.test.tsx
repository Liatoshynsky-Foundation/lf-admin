import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';

import FilesTabPage from './page';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NOT_FOUND');
  })
}));

jest.mock('../FilesPageContent', () => ({
  FilesPageContent: ({ activeTab }: { activeTab: string }) => (
    <div data-testid="files-page-content">{activeTab}</div>
  ),
}));

jest.mock('~/constants/files', () => ({
  FILE_TABS: [
    { value: 'valid-tab', disabled: false },
    { value: 'disabled-tab', disabled: true }
  ]
}));

describe('FilesTabPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render FilesPageContent when tab is valid and enabled', async () => {
    const params = Promise.resolve({ tab: 'valid-tab' });
    const ui = await FilesTabPage({ params });
    render(ui);

    expect(screen.getByTestId('files-page-content')).toHaveTextContent('valid-tab');
    expect(notFound).not.toHaveBeenCalled();
  });

  it('should call notFound when tab is disabled', async () => {
    const params = Promise.resolve({ tab: 'disabled-tab' });

    await expect(FilesTabPage({ params })).rejects.toThrow('NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('should call notFound when tab does not exist', async () => {
    const params = Promise.resolve({ tab: 'invalid-tab' });

    await expect(FilesTabPage({ params })).rejects.toThrow('NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });
});
