import { GraphQLError } from 'graphql';

import { endpointRepositoryHandler } from '../helpers';
import { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
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

    return repo.create({
      ...input,
      slug,
      status: input.status || EventStatus.Draft
    });
  },

  updateEvent: async (_: unknown, { id, input }: UpdateEventArgs, context: GraphQLContext): Promise<EventsEntity> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const repo = context.requestContainer.cradle.eventsRepository;
    const updateData = { ...input };
    if (updateData.meta && updateData.meta.views === undefined) {
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
    return res;
  },

  deleteEvent: async (_: unknown, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
    if (!context || !context.admin) {
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