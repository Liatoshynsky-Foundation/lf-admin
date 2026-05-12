import { GraphQLError } from 'graphql';

import {
  endpointRepositoryHandler,
  syncImagesCrops
} from '../helpers';
import { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';

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
import { EventsEntity } from '~/domain/entities/Events';
import { CreateEventInput, UpdateEventInput } from '~/domain/repositories/eventsRepository';
import { generateUniqueSlug } from '~/src/shared/utils/slugGenerator/slugGenerator';
import { EventStatus } from '~/types/enums/common.enums';

export interface CreateEventArgs {
  input: Omit<CreateEventInput, 'slug'>;
}

interface UpdateEventArgs {
  id: string;
  input: UpdateEventInput;
}

interface IncrementViewsArgs { id: string }

const endpointHandler = endpointRepositoryHandler('eventsRepository');

export const EventsMutation = {
  createEvent: async (_: unknown, { input }: CreateEventArgs, context: GraphQLContext): Promise<EventsEntity> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const repo = context.requestContainer.cradle.eventsRepository;
    const titleUk = input.title?.uk;

    if (!titleUk) throw new Error('TITLE_REQUIRED_FOR_SLUG');

    const slug = await generateUniqueSlug(titleUk, {
      checkExists: async (s: string) => {
        const existing = await repo.findBySlug(s);
        return existing !== null;
      }
    });

    const res = await repo.create({
      ...input,
      slug,
      status: input.status || EventStatus.Draft
    });

    if (input.coverImage?.crop) {
      await syncImagesCrops(res.id, input.coverImage, { isCoverImage: true });
    }
    if (input.content) {
      await syncImagesCrops(res.id, input.content);
    }

    const assetsRepo = context.requestContainer.cradle.assetsRepository;
    await markImagesAsUsed(assetsRepo, input.content, input.coverImage, 'events', res.id);

    return res;
  },

  updateEvent: async (_: unknown, { id, input }: UpdateEventArgs, context: GraphQLContext): Promise<EventsEntity> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const repo = context.requestContainer.cradle.eventsRepository;
    const updateData = { ...input };
    if (updateData.meta?.views === undefined) {
      delete updateData.meta;
    }

    if (input.title?.uk) {
      updateData.slug = await generateUniqueSlug(input.title.uk, {
        checkExists: async (s: string) => {
          const ex = await repo.findBySlug(s);
          return ex !== null && ex.id !== id;
        }
      });
    }

    const res = await repo.update(id, updateData as Parameters<typeof repo.update>[1]);
    if (!res) throw new GraphQLError('EVENT_NOT_FOUND', { extensions: { code: 'EVENT_NOT_FOUND' } });

    if (input.coverImage?.crop) {
      await syncImagesCrops(res.id, input.coverImage, { isCoverImage: true });
    }
    if (input.content) {
      await syncImagesCrops(res.id, input.content);
    }

    const assetsRepo = context.requestContainer.cradle.assetsRepository;
    await markImagesAsUsed(assetsRepo, input.content, input.coverImage, 'events', res.id);

    return res;
  },

  deleteEvent: async (_: unknown, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
    if (!context?.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const repo = context.requestContainer.cradle.eventsRepository;
    return repo.delete(id);
  },

  incrementEventViews: endpointHandler<IncrementViewsArgs, EventsEntity | null>(
    async ({ args: { id }, repo }) => repo.incrementViews(id)
  )
};