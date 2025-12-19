import { GraphQLError } from 'graphql';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { MediaStatus } from '~/domain/entities/MediaMentions';

type MediaFiltersInput = {
  status?: string;
};

type MediaFiltersArgs = { filters?: MediaFiltersInput };
type PaginatedMediaArgs = { page?: number; limit?: number; filters?: MediaFiltersInput };

const mapFilters = (filters?: MediaFiltersInput) => {
  if (!filters) return undefined;

  return {
    status: filters.status as MediaStatus | undefined
  };
};

export const MediaMentionsQuery = {
  mediaMentionById: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { mediaMentionsService } = context.requestContainer.cradle;

    return mediaMentionsService.getById(id);
  },

  mediaMentionBySlug: async (_: unknown, { slug }: { slug: string }, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { mediaMentionsService } = context.requestContainer.cradle;

    return mediaMentionsService.getBySlug(slug);
  },

  allMediaMentions: async (_: unknown, { filters }: MediaFiltersArgs, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { mediaMentionsService } = context.requestContainer.cradle;

    return mediaMentionsService.getAll(mapFilters(filters));
  },

  paginatedMediaMentions: async (
    _: unknown,
    { page = 1, limit = 10, filters }: PaginatedMediaArgs,
    context: GraphQLContext
  ) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { mediaMentionsService } = context.requestContainer.cradle;

    return mediaMentionsService.getPaginated(page, limit, mapFilters(filters));
  },

  mediaMentionsCount: async (_: unknown, { status }: { status?: MediaStatus }, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { mediaMentionsService } = context.requestContainer.cradle;

    return mediaMentionsService.getCount(status ? { status } : undefined);
  }
};
