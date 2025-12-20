import { GraphQLError } from 'graphql';

import { endpointRepositoryHandler } from '../helpers';
import { processNewsContent } from './processNewsContent/processNewsContent';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import type { LocalizedContent, News, NewsImageBlock } from '~/domain/entities/News';
import { newsServiceErrors } from '~/src/constants/errors';
import { CreateNewsInput, NewsRepository, UpdateNewsInput } from '~/src/domain/repositories/newsRepository';
import { generateUniqueSlug } from '~/src/shared/utils/slugGenerator/slugGenerator';
import { NewsStatus } from '~/types/enums/common.enums';

type CreateNewsGQLInput = {
  title: LocalizedContent;
  description?: LocalizedContent;
  content: LocalizedContent;
  coverImage: NewsImageBlock;
  newsDate?: string;
  status?: string;
  publishedAt?: string;
};

type UpdateNewsGQLInput = {
  title?: LocalizedContent;
  description?: LocalizedContent;
  content?: LocalizedContent;
  coverImage?: NewsImageBlock;
  newsDate?: string;
  status?: string;
  publishedAt?: string;
};

type CreateNewsArgs = { input: CreateNewsGQLInput };
type UpdateNewsArgs = { id: string; input: UpdateNewsGQLInput };

const parseDate = (dateStr?: string | null): Date | undefined => {
  if (!dateStr) return undefined;
  return new Date(dateStr);
};

const extractTitleForSlug = (title: UpdateNewsGQLInput['title']): string => {
  if (typeof title === 'object' && title && 'uk' in title) {
    return title.uk as string;
  }
  if (typeof title === 'string') {
    return title;
  }
  return '';
};

const processSlugUpdate = async (
  id: string,
  title: UpdateNewsGQLInput['title'],
  newsRepository: NewsRepository,
  updateData: UpdateNewsInput
): Promise<void> => {
  const news = await newsRepository.findById(id);
  if (!news) {
    throw new Error(newsServiceErrors.NEWS_NOT_FOUND(id));
  }

  const titleForSlug = extractTitleForSlug(title);

  if (titleForSlug) {
    const newSlug = await generateUniqueSlug(titleForSlug, {
      checkExists: async (slug: string) => {
        const existing = await newsRepository.findBySlug(slug);
        return existing !== null && existing.id !== id;
      }
    });

    updateData.slug = newSlug;
  }
};

const processContentFields = async (input: UpdateNewsGQLInput, updateData: UpdateNewsInput): Promise<void> => {
  const contentToProcess = {
    content: input.content || { uk: null, en: null },
    description: input.description,
    coverImage: input.coverImage
  };

  const processedContent = await processNewsContent(contentToProcess);

  if (input.content) {
    updateData.content = processedContent.content;
  }
  if (input.description) {
    updateData.description = processedContent.description;
  }
  if (input.coverImage) {
    updateData.coverImage = processedContent.coverImage;
  }
};

const endpointHandler = endpointRepositoryHandler('newsRepository');

export const NewsMutation = {
  createNews: async (_: unknown, { input }: CreateNewsArgs, context: GraphQLContext): Promise<News> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const repo = context.requestContainer.cradle.newsRepository;

    const titleForSlug = extractTitleForSlug(input.title);

    if (!titleForSlug) {
      throw new Error(newsServiceErrors.TITLE_REQUIRED_FOR_SLUG);
    }

    const slug = await generateUniqueSlug(titleForSlug, {
      checkExists: async (slug: string) => {
        const existing = await repo.findBySlug(slug);
        return existing !== null;
      }
    });

    const processedInput = await processNewsContent(input);

    const newsData: CreateNewsInput = {
      title: processedInput.title,
      description: processedInput.description,
      content: processedInput.content,
      coverImage: processedInput.coverImage,
      newsDate: parseDate(input.newsDate),
      slug,
      status: input.status as NewsStatus,
      publishedAt: parseDate(input.publishedAt),
      meta: {
        views: 0
      }
    };

    return repo.create(newsData);
  },

  updateNews: async (_: unknown, { id, input }: UpdateNewsArgs, context: GraphQLContext): Promise<News> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const repo = context.requestContainer.cradle.newsRepository;

    const updateData: UpdateNewsInput = {
      title: input.title,
      description: input.description,
      newsDate: parseDate(input.newsDate),
      status: input.status as NewsStatus | undefined,
      publishedAt: parseDate(input.publishedAt)
    };

    if (input.content || input.description || input.coverImage) {
      await processContentFields(input, updateData);
    }

    if (input.title) {
      await processSlugUpdate(id, input.title, repo, updateData);
    }

    const res = await repo.update(id, updateData);
    if (!res) {
      throw new GraphQLError(newsServiceErrors.NEWS_NOT_FOUND(id), {
        extensions: { code: 'NEWS_NOT_FOUND' }
      });
    }

    return res;
  },

  deleteNews: endpointHandler(async ({ args: { id }, repo }) => repo.delete(id)),

  incrementNewsViews: endpointHandler(async ({ args: { id }, repo }) => repo.incrementViews(id))
};
