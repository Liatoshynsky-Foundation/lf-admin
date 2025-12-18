import { GraphQLError } from 'graphql';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import type { News, NewsImageBlock } from '~/domain/entities/News';
import { NewsStatus } from '~/types/enums/common.enums';

type CreateNewsInput = {
  title: any;
  description?: any;
  content: any;
  coverImage: any;
  newsDate?: string;
  status?: string;
  publishedAt?: string;
};

type UpdateNewsInput = {
  title?: any;
  description?: any;
  content?: any;
  coverImage?: any;
  newsDate?: string;
  status?: string;
  publishedAt?: string;
};

type PublishNewsInput = {
  id: string;
  publishedAt?: string;
};

type CreateNewsArgs = { input: CreateNewsInput };
type UpdateNewsArgs = { id: string; input: UpdateNewsInput };
type PublishNewsArgs = { input: PublishNewsInput };
type IdArgs = { id: string };

const parseDate = (dateStr?: string | null): Date | null | undefined => {
  if (dateStr === undefined) return undefined;
  if (dateStr === null) return null;
  return new Date(dateStr);
};

export const NewsMutation = {
  createNews: async (_: unknown, { input }: CreateNewsArgs, context: GraphQLContext): Promise<News> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { newsService } = context.requestContainer.cradle;

    const serviceInput = {
      title: input.title,
      description: input.description,
      content: input.content,
      coverImage: input.coverImage as NewsImageBlock,
      newsDate: parseDate(input.newsDate),
      status: input.status as NewsStatus | undefined,
      publishedAt: parseDate(input.publishedAt)
    };

    return newsService.createNews(serviceInput);
  },

  updateNews: async (_: unknown, { id, input }: UpdateNewsArgs, context: GraphQLContext): Promise<News> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { newsService } = context.requestContainer.cradle;

    const serviceInput = {
      title: input.title,
      description: input.description,
      content: input.content,
      coverImage: input.coverImage ? (input.coverImage as NewsImageBlock) : undefined,
      newsDate: parseDate(input.newsDate),
      status: input.status as NewsStatus | undefined,
      publishedAt: parseDate(input.publishedAt)
    };

    return newsService.updateNews(id, serviceInput);
  },

  publishNews: async (_: unknown, { input }: PublishNewsArgs, context: GraphQLContext): Promise<News> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { newsService } = context.requestContainer.cradle;

    return newsService.publishNews({
      id: input.id,
      publishedAt: parseDate(input.publishedAt) as Date | undefined
    });
  },

  unpublishNews: async (_: unknown, { id }: IdArgs, context: GraphQLContext): Promise<News> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { newsService } = context.requestContainer.cradle;
    return newsService.unpublishNews(id);
  },

  archiveNews: async (_: unknown, { id }: IdArgs, context: GraphQLContext): Promise<News> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { newsService } = context.requestContainer.cradle;
    return newsService.archiveNews(id);
  },

  hideNews: async (_: unknown, { id }: IdArgs, context: GraphQLContext): Promise<News> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { newsService } = context.requestContainer.cradle;
    return newsService.hideNews(id);
  },

  deleteNews: async (_: unknown, { id }: IdArgs, context: GraphQLContext): Promise<boolean> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { newsService } = context.requestContainer.cradle;

    return newsService.deleteNews(id);
  },

  incrementNewsViews: async (_: unknown, { id }: IdArgs, context: GraphQLContext): Promise<News> => {
    const { newsService } = context.requestContainer.cradle;

    return newsService.incrementViews(id);
  }
};
