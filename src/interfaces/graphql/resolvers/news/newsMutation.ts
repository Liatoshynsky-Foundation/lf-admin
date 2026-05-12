import { GraphQLError } from 'graphql';

import {
  endpointRepositoryHandler,
  extractTitleForSlug,
  processSlugUpdate,
  syncImagesCrops
} from '../helpers';
import { processNewsContent } from './processNewsContent/processNewsContent';
import type { GraphQLContext } from '~/back-shared/types/container/types';

type UsageRepo = { addUsageRef: (url: string, ref: { pageId?: string; blockId?: string; locale?: string }) => Promise<void> };

const extractHttpSrcs = (value: unknown, srcs: Set<string>): void => {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) { value.forEach((v) => extractHttpSrcs(v, srcs)); return; }
  const obj = value as Record<string, unknown>;
  if (typeof obj.src === 'string' && obj.src.startsWith('http')) srcs.add(obj.src);
  Object.values(obj).forEach((v) => extractHttpSrcs(v, srcs));
};

const markImagesAsUsed = async (
  repo: UsageRepo,
  content: { uk?: unknown; en?: unknown } | null | undefined,
  coverImage: { src?: string } | null | undefined,
  pageId: string,
  blockId: string
): Promise<void> => {
  const ukSrcs = new Set<string>();
  const enSrcs = new Set<string>();

  if (content?.uk) extractHttpSrcs(content.uk, ukSrcs);
  if (content?.en) extractHttpSrcs(content.en, enSrcs);

  const promises: Promise<void>[] = [
    ...Array.from(ukSrcs).map((url) => repo.addUsageRef(url, { pageId, blockId, locale: 'uk' })),
    ...Array.from(enSrcs).map((url) => repo.addUsageRef(url, { pageId, blockId, locale: 'en' }))
  ];

  if (coverImage?.src?.startsWith('http')) {
    promises.push(repo.addUsageRef(coverImage.src, { pageId, blockId, locale: 'uk' }));
    promises.push(repo.addUsageRef(coverImage.src, { pageId, blockId, locale: 'en' }));
  }

  await Promise.all(promises);
};
import { graphqlErrors } from '~/constants/errors';
import {LocalizedBoolean, LocalizedContent, LocalizedImage, LocalizedString} from '~/domain/entities/BaseContent';
import type { News } from '~/domain/entities/News';
import { newsServiceErrors } from '~/src/constants/errors';
import { CreateNewsInput, UpdateNewsInput } from '~/src/domain/repositories/newsRepository';
import { generateUniqueSlug } from '~/src/shared/utils/slugGenerator/slugGenerator';
import { NewsStatus } from '~/types/enums/common.enums';

export type CreateNewsGQLInput = {
  adminTitle: string;
  title: LocalizedString;
  description: LocalizedString;
  keywords: LocalizedString;
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
interface IdArgs { id: string }

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
      ...processedInput,
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
      await processSlugUpdate(id, input.title, repo, updateData);
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