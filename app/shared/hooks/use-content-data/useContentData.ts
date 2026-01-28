'use client';

import { useCallback, useEffect, useState } from 'react';

import { graphqlFetcher } from '~/shared/hooks/use-graphql-fetcher/useGraphqlFetcher';
import { ContentType, NewsItem, UseContentDataResult } from '~/types/contentGrid';

const PAGINATED_NEWS_QUERY = `
  query PaginatedNews($page: Int, $limit: Int, $filters: NewsFiltersInput) {
    paginatedNews(page: $page, limit: $limit, filters: $filters) {
      news {
        id
        slug
        title {
          uk
          en
        }
        description {
          uk
          en
        }
        coverImage {
          src
          alt {
            uk
            en
          }
        }
        createdAt
        publishedAt
        newsDate
        status
        meta {
          views
        }
      }
      total
      totalPages
      page
    }
  }
`;

interface PaginatedNewsResponse {
  paginatedNews: {
    news: any[];
    total: number;
    totalPages: number;
    page: number;
  };
}

export function useContentData(contentType: ContentType, limit: number = 12): UseContentDataResult<NewsItem> {
  const [data, setData] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      /* eslint-disable */
      switch (contentType) {
        case ContentType.NEWS: {
          const result = await graphqlFetcher<PaginatedNewsResponse, any>({
            query: PAGINATED_NEWS_QUERY,
            variables: {
              page: 1,
              limit,
              filters: {
                sortBy: 'publishedAt',
                sortOrder: 'desc'
              }
            }
          });

          const transformedData: NewsItem[] = result.paginatedNews.news.map((item: any) => ({
            id: item.id,
            slug: item.slug,
            title: item.title.uk || item.title.en,
            description: item.description?.uk || item.description?.en || '',
            coverImage: {
              src: item.coverImage.src,
              alt: item.coverImage.alt.uk || item.coverImage.alt.en
            },
            createdAt: item.createdAt,
            publishedAt: item.publishedAt,
            newsDate: item.newsDate,
            status: item.status,
            views: item.meta.views
          }));

          setData(transformedData);
          break;
        }
        case ContentType.EVENTS:
          throw new Error('Events endpoint not yet implemented');
        case ContentType.MEDIA:
          throw new Error('Media endpoint not yet implemented');
        default:
          throw new Error(`Unknown content type: ${contentType}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [contentType, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: () => {
      void fetchData();
    }
  };
}
