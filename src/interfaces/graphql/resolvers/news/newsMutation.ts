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

const DESCRIPTION_MIN_LENGTH = 2;
const DESCRIPTION_MAX_LENGTH = 250;

const ALT_TEXT_MIN_LENGTH = 2;

type LocalizedLengthValidationOptions = {
  fieldName: 'title' | 'description' | 'altText';
  minLength?: number;
  maxLength?: number;
};

const getInvalidLocalizedLengthFields = (
  value: LocalizedString | undefined,
  { fieldName, minLength, maxLength }: LocalizedLengthValidationOptions
): string[] => {
  if (!value) return [];

  const invalidFields = (['uk', 'en'] as const)
    .filter((lang) => {
      const localizedValue = value[lang];

      if (typeof localizedValue !== 'string') {
        return false;
      }

      const length = localizedValue.trim().length;

      return (minLength !== undefined && length < minLength) || (maxLength !== undefined && length > maxLength);
    })
    .map((lang) => `${fieldName}.${lang}`);

  return invalidFields;
};

const throwBadUserInput = (message: string, fields: string[]): void => {
  if (fields.length === 0) return;

  throw new GraphQLError(message, {
    extensions: {
      code: 'BAD_USER_INPUT',
      fields
    }
  });
};

const validateDescriptionLength = (description: LocalizedString | undefined): void => {
  const invalidFields = getInvalidLocalizedLengthFields(description, {
    fieldName: 'description',
    minLength: DESCRIPTION_MIN_LENGTH,
    maxLength: DESCRIPTION_MAX_LENGTH
  });

  throwBadUserInput(newsServiceErrors.DESCRIPTION_LENGTH_INVALID, invalidFields);
};

const validateTitleMaxLength = (title: LocalizedString | undefined): void => {
  const invalidFields = getInvalidLocalizedLengthFields(title, {
    fieldName: 'title',
    maxLength: TITLE_MAX_LENGTH
  });

  throwBadUserInput(newsServiceErrors.TITLE_TOO_LONG_FOR_SLUG, invalidFields);
};

const validateAltTextMinLength = (coverImage: LocalizedImage | undefined): void => {
  if (!coverImage?.alt) return;

  const { alt } = coverImage;

  const invalidFields = (['uk', 'en'] as const)
    .filter((lang) => {
      const localizedValue = alt[lang];
      if (typeof localizedValue !== 'string') return false;

      const length = localizedValue.trim().length;
      return length > 0 && length < ALT_TEXT_MIN_LENGTH;
    })
    .map((lang) => `altText.${lang}`);

  throwBadUserInput(newsServiceErrors.ALT_TEXT_TOO_SHORT, invalidFields);
};

const trimLocalizedString = (value: LocalizedString | undefined): LocalizedString | undefined => {
  if (!value) return value;

  const trimmed: LocalizedString = { ...value };

  (['uk', 'en'] as const).forEach((lang) => {
    const localizedValue = value[lang];

    if (typeof localizedValue === 'string') {
      trimmed[lang] = localizedValue.trim();
    }
  });

  return trimmed;
};

const trimLocalizedImageAlt = (coverImage: LocalizedImage | undefined): LocalizedImage | undefined => {
  if (!coverImage?.alt) return coverImage;

  return {
    ...coverImage,
    alt: trimLocalizedString(coverImage.alt) ?? coverImage.alt
  };
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

    const trimmedInput = {
      ...input,
      title: trimLocalizedString(input.title) ?? input.title,
      description: trimLocalizedString(input.description) ?? input.description,
      coverImage: trimLocalizedImageAlt(input.coverImage) ?? input.coverImage
    };

    const titleForSlug = extractTitleForSlug(trimmedInput.title);

    if (!titleForSlug) {
      throw new Error(newsServiceErrors.TITLE_REQUIRED_FOR_SLUG);
    } else if (titleForSlug.trim().length < 2) {
      throw new Error(newsServiceErrors.TITLE_TOO_SHORT_FOR_SLUG);
    }

    validateTitleMaxLength(trimmedInput.title);
    validateDescriptionLength(trimmedInput.description);
    validateAltTextMinLength(trimmedInput.coverImage);

    const slug = await generateUniqueSlug(titleForSlug, {
      checkExists: async (slug: string) => {
        const existing = await repo.findBySlug(slug);
        return existing !== null;
      }
    });

    const processedInput = await processNewsContent(trimmedInput);

    const newsData: CreateNewsInput = {
      ...processedInput,
      title: trimmedInput.title,
      description: processedInput.description,
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

    const trimmedInput = {
      ...input,
      title: trimLocalizedString(input.title) ?? input.title,
      description: trimLocalizedString(input.description) ?? input.description,
      coverImage: trimLocalizedImageAlt(input.coverImage) ?? input.coverImage
    };

    validateDescriptionLength(trimmedInput.description);
    if (input.coverImage) {
      validateAltTextMinLength(trimmedInput.coverImage);
    }

    if (input.content || input.description || input.coverImage) {
      await processContentFields(trimmedInput, updateData);
    }

    if (trimmedInput.title) {
      const titleForSlug = extractTitleForSlug(trimmedInput.title);
      if (!titleForSlug) {
        throw new Error(newsServiceErrors.TITLE_REQUIRED_FOR_SLUG);
      } else if (titleForSlug.trim().length < 2) {
        throw new Error(newsServiceErrors.TITLE_TOO_SHORT_FOR_SLUG);
      }

      validateTitleMaxLength(trimmedInput.title);

      await processSlugUpdate(id, trimmedInput.title, repo, updateData);
      updateData.title = trimmedInput.title;
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
