import { NextResponse } from 'next/server';

import { getApolloServer } from '~/api/graphql/apolloServer';

const PAGINATED_NEWS_QUERY = `
  query PaginatedNews($page: Int, $limit: Int, $filters: NewsFiltersInput) {
    paginatedNews(page: $page, limit: $limit, filters: $filters) {
      news {
        id
        slug
        title {
          en
          uk
        }
        description {
          en
          uk
        }
        coverImage {
          src
          alt {
            en
            uk
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '12', 10);
    const status = searchParams.get('status') || 'published';

    const server = getApolloServer();

    const apolloResponse = await server.executeOperation({
      query: PAGINATED_NEWS_QUERY,
      variables: {
        page,
        limit,
        filters: {
          status,
          sortBy: 'publishedAt',
          sortOrder: 'desc'
        }
      }
    });

    if (apolloResponse.body.kind === 'single') {
      const { singleResult } = apolloResponse.body;

      if (singleResult?.errors) {
        return NextResponse.json({ error: 'Failed to fetch news', details: singleResult.errors }, { status: 500 });
      }

      return NextResponse.json(singleResult.data?.paginatedNews || { news: [], total: 0, totalPages: 0, page: 1 });
    }

    return NextResponse.json({ error: 'Unexpected response format' }, { status: 500 });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
