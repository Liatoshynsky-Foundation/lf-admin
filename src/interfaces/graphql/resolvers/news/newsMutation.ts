import { GraphQLError } from 'graphql';

import {
  endpointRepositoryHandler,
  extractTitleForSlug,
  markImagesAsUsed,
  processSlugUpdate,
  syncImagesCrops
} from '../helpers';
import { processNewsContent } from './processNewsContent/processNewsContent';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { LocalizedBoolean, LocalizedContent, LocalizedImage, LocalizedString } from '~/domain/entities/BaseContent';
import type { News } from '~/domain/entities/News';
import { newsServiceErrors } from '~/src/constants/errors';
import { CreateNewsInput, UpdateNewsInput } from '~/src/domain/repositories/newsRepository';
import { generateUniqueSlug } from '~/src/shared/utils/slugGenerator/slugGenerator';
import { NewsStatus } from '~/types/enums/common.enums';

export type CreateNewsGQLInput = {
  adminTitle: string;
  title: LocalizedString;
  description: LocalizedString;
  keywords?: LocalizedString;
  allowIndexation: LocalizedBoolean;
  content: LocalizedContent;
  coverImage: LocalizedImage;
  newsDate?: string;
  status?: NewsStatus;
  publishedAt?: string;
};

export type UpdateNewsGQLInput = Partial<CreateNewsGQLInput>;

type CreateNewsArgs = { input: CreateNewsGQLInput };
type UpdateNewsArgs = { id: string; input: UpdateNewsGQLInput };
interface IdArgs {
  id: string;
}

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

const TITLE_MAX_LENGTH = 150;

const validateTitleMaxLength = (title: LocalizedString | undefined): void => {
  if (!title) return;

  (['uk', 'en'] as const).forEach((lang) => {
    const value = title[lang];
    if (typeof value === 'string' && value.trim().length > TITLE_MAX_LENGTH) {
      throw new GraphQLError(newsServiceErrors.TITLE_TOO_LONG_FOR_SLUG, {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }
  });
};

// Trims uk/en title values so the persisted title always matches what was validated
// (validation checks trimmed length; without this, a title with trailing/leading
// whitespace could be stored with a raw length different from its validated length).
const trimLocalizedTitle = (title: LocalizedString | undefined): LocalizedString | undefined => {
  if (!title) return title;

  const trimmed: LocalizedString = { ...title };

  (['uk', 'en'] as const).forEach((lang) => {
    const value = title[lang];
    if (typeof value === 'string') {
      trimmed[lang] = value.trim();
    }
  });

  return trimmed;
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
    } else if (titleForSlug.trim().length < 2) {
      throw new Error(newsServiceErrors.TITLE_TOO_SHORT_FOR_SLUG);
    }

    validateTitleMaxLength(input.title);

    const slug = await generateUniqueSlug(titleForSlug, {
      checkExists: async (slug: string) => {
        const existing = await repo.findBySlug(slug);
        return existing !== null;
      }
    });

    const processedInput = await processNewsContent(input);

    const newsData: CreateNewsInput = {
      ...processedInput,
      title: trimLocalizedTitle(input.title) ?? input.title,
      slug,
      newsDate: input.newsDate,
      status: input.status || NewsStatus.Draft,
      publishedAt: input.publishedAt,
      meta: { views: 0 }
    };

    const res = await repo.create(newsData);

    if (input.coverImage?.crop) {
      await syncImagesCrops(res.id, input.coverImage, { isCoverImage: true });
    }
    if (input.content) {
      await syncImagesCrops(res.id, input.content);
    }

    const assetsRepo = context.requestContainer.cradle.assetsRepository;
    await markImagesAsUsed(assetsRepo, processedInput.content, processedInput.coverImage, 'news', res.id);

    return res;
  },

  updateNews: async (_: unknown, { id, input }: UpdateNewsArgs, context: GraphQLContext): Promise<News> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const repo = context.requestContainer.cradle.newsRepository;

    const existingNews = await repo.findById(id);
    if (!existingNews) {
      throw new GraphQLError(newsServiceErrors.NEWS_NOT_FOUND(id), {
        extensions: { code: 'NEWS_NOT_FOUND' }
      });
    }

    const updateData: UpdateNewsInput = {
      ...input
    };

    if (input.content || input.description || input.coverImage) {
      await processContentFields(input, updateData);
    }

    if (input.title) {
      const titleForSlug = extractTitleForSlug(input.title);
      if (!titleForSlug) {
        throw new Error(newsServiceErrors.TITLE_REQUIRED_FOR_SLUG);
      } else if (titleForSlug.trim().length < 2) {
        throw new Error(newsServiceErrors.TITLE_TOO_SHORT_FOR_SLUG);
      }

      validateTitleMaxLength(input.title);

      await processSlugUpdate(id, input.title, repo, updateData);
      updateData.title = trimLocalizedTitle(input.title) ?? input.title;
    }

    const res = await repo.update(id, updateData);
    if (!res) {
      throw new GraphQLError(newsServiceErrors.NEWS_NOT_FOUND(id), {
        extensions: { code: 'NEWS_NOT_FOUND' }
      });
    }

    if (input.coverImage?.crop) {
      await syncImagesCrops(res.id, input.coverImage, { isCoverImage: true });
    }
    if (input.content) {
      await syncImagesCrops(res.id, input.content);
    }

    const assetsRepo = context.requestContainer.cradle.assetsRepository;
    await markImagesAsUsed(assetsRepo, updateData.content, updateData.coverImage, 'news', res.id);

    return res;
  },

  deleteNews: endpointHandler<IdArgs, boolean>(async ({ args: { id }, repo }) => repo.delete(id)),

  incrementNewsViews: endpointHandler<IdArgs, News | null>(async ({ args: { id }, repo }) => repo.incrementViews(id))
};
