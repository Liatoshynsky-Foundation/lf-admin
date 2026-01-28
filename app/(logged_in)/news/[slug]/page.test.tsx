import { render, screen, waitFor } from '@testing-library/react';

import NewsItem from './page';
import { client } from '~/lib/utils/apollo-client';

jest.mock('~/lib/utils/apollo-client', () => ({
  client: {
    query: jest.fn()
  }
}));

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

const mockClient = client as jest.Mocked<typeof client>;

describe('NewsItem Page', () => {
  beforeEach(() => {
    mockClient.query.mockImplementation(({ variables }) => {
      const slug = variables?.slug || '123';
      return Promise.resolve({
        data: {
          newsBySlug: {
            id: slug,
            slug: slug,
            status: 'PUBLISHED',
            publishedAt: '2024-01-01',
            title: {
              uk: 'Українська назва',
              en: 'English Title'
            },
            description: {
              uk: 'Український опис',
              en: 'English description'
            },
            content: {
              uk: { blocks: [] },
              en: { blocks: [] }
            },
            coverImage: {
              src: '/test-image.jpg',
              alt: {
                uk: 'Тестове зображення',
                en: 'Test image'
              }
            }
          }
        },
        loading: false,
        networkStatus: 7
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all main components', async () => {
    const params = Promise.resolve({ slug: '123' });
    render(<NewsItem params={params} />);

    await waitFor(() => {
      expect(screen.getByTestId('news-detail-header')).toBeInTheDocument();
    });

    expect(screen.getByTestId('news-details')).toBeInTheDocument();
    expect(screen.getByTestId('news-content-media')).toBeInTheDocument();
  });

  it('passes correct id to header component', async () => {
    const params = Promise.resolve({ slug: '456' });
    render(<NewsItem params={params} />);

    await waitFor(() => {
      expect(screen.getByTestId('news-detail-header')).toHaveTextContent('456');
    });
  });
});
