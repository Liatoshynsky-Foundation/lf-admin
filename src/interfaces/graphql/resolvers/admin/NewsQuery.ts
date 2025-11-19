import { GraphQLError } from 'graphql';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { NewsStatus } from '~/types/enums/common.enums';

type NewsFiltersInput = {
  status?: string;
  slug?: string;
  sortBy?: string;
  sortOrder?: string;
};

type NewsFiltersArgs = { filters?: NewsFiltersInput };
type PaginatedNewsArgs = { page?: number; limit?: number; filters?: NewsFiltersInput };
type NewsCountArgs = { status?: NewsStatus };

const mapFilters = (filters?: NewsFiltersInput) => {
  if (!filters) return undefined;

  return {
    status: filters.status as NewsStatus | undefined,
    slug: filters.slug,
    sortBy: filters.sortBy as 'createdAt' | 'updatedAt' | 'publishedAt' | 'newsDate' | undefined,
    sortOrder: filters.sortOrder as 'asc' | 'desc' | undefined
  };
};

export const NewsQuery = {
  newsById: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }
    const { newsService } = context.requestContainer.cradle;
    return newsService.getNewsById(id);
  },

  newsBySlug: async (_: unknown, { slug }: { slug: string }, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }
    const { newsService } = context.requestContainer.cradle;
    return newsService.getNewsBySlug(slug);
  },

  allNews: async (_: unknown, { filters }: NewsFiltersArgs, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }
    const { newsService } = context.requestContainer.cradle;
    return newsService.getAllNews(mapFilters(filters));
  },

  publishedNews: async (_: unknown, { filters }: NewsFiltersArgs, context: GraphQLContext) => {
    const { newsService } = context.requestContainer.cradle;
    return newsService.getPublishedNews(mapFilters(filters));
  },

  paginatedNews: async (_: unknown, { page = 1, limit = 10, filters }: PaginatedNewsArgs, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }
    const { newsService } = context.requestContainer.cradle;
    return newsService.getPaginatedNews(page, limit, mapFilters(filters));
  },

  newsCount: async (_: unknown, { status }: NewsCountArgs, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }
    const { newsService } = context.requestContainer.cradle;
    return newsService.getNewsCount(status ? { status } : undefined);
  }
};
