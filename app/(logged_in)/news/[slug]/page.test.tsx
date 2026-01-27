import { render, screen } from '@testing-library/react';

import NewsItem from './page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}));

jest.mock('~/shared/components/news-detail-header/NewsDetailHeader', () => ({
  NewsDetailHeader: ({ title, newsId }: { title: string; newsId: string }) => (
    <div data-testid="news-detail-header">
      {title} - {newsId}
    </div>
  )
}));

jest.mock('~/shared/components/news-details/NewsDetails', () => ({
  NewsDetails: ({ title }: { title: string }) => <div data-testid="news-details">{title}</div>
}));

jest.mock('~/shared/components/news-content-media/NewsContentMedia', () => ({
  NewsContentMedia: () => <div data-testid="news-content-media">Content Media</div>
}));

describe('NewsItem Page', () => {
  it('renders all main components', () => {
    const params = { id: '123' };
    render(<NewsItem params={params} />);

    expect(screen.getByTestId('news-detail-header')).toBeInTheDocument();
    expect(screen.getByTestId('news-details')).toBeInTheDocument();
    expect(screen.getByTestId('news-content-media')).toBeInTheDocument();
  });

  it('passes correct id to header component', () => {
    const params = { id: '456' };
    render(<NewsItem params={params} />);

    expect(screen.getByTestId('news-detail-header')).toHaveTextContent('456');
  });
});
