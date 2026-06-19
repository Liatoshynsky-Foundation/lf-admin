import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';

import PublicationsTypePage from './page';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  })
}));

jest.mock('../PublicationsPageContent', () => ({
  PublicationsPageContent: ({ activeTab }: { activeTab: string }) => (
    <div data-testid="publications-page-content">{activeTab}</div>
  )
}));

describe('PublicationsTypePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders content for a valid type', async () => {
    render(await PublicationsTypePage({ params: Promise.resolve({ type: 'news' }) }));

    expect(screen.getByTestId('publications-page-content')).toHaveTextContent('news');
    expect(notFound).not.toHaveBeenCalled();
  });

  it('calls notFound for an invalid type', async () => {
    await expect(PublicationsTypePage({ params: Promise.resolve({ type: 'invalid' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND'
    );

    expect(notFound).toHaveBeenCalled();
  });
});
