import { GraphQLError } from 'graphql';

import type { ImageBlock } from '~/back-shared/types/common';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { EventStatus } from '~/back-shared/types/enums/common.enums';
import { graphqlErrors } from '~/constants/errors';
import type { Event } from '~/domain/entities/Event';

type CreateEventInput = {
  eventDate?: string | null;
  eventLink: string;
  title: any;
  description?: any;
  content: any;
  coverImage: any;
  status?: string;
};

type UpdateEventInput = {
  eventDate?: string | null;
  eventLink?: string;
  title?: any;
  description?: any;
  content?: any;
  coverImage?: any;
  status?: string;
};

type CreateEventArgs = { input: CreateEventInput };
type UpdateEventArgs = { id: string; input: UpdateEventInput };
type IdArgs = { id: string };

const parseDate = (dateStr?: string | null): Date | null | undefined => {
  if (dateStr === undefined) return undefined;
  if (dateStr === null) return null;
  return new Date(dateStr);
};

export const EventMutation = {
  createEvent: async (_: unknown, { input }: CreateEventArgs, context: GraphQLContext): Promise<Event> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { eventService } = context.requestContainer.cradle;

    const serviceInput = {
      eventDate: parseDate(input.eventDate),
      eventLink: input.eventLink,
      title: input.title,
      description: input.description,
      content: input.content,
      coverImage: input.coverImage as ImageBlock,
      status: input.status as EventStatus | undefined
    };

    return eventService.createEvent(serviceInput);
  },

  updateEvent: async (_: unknown, { id, input }: UpdateEventArgs, context: GraphQLContext): Promise<Event> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { eventService } = context.requestContainer.cradle;

    const serviceInput = {
      eventDate: parseDate(input.eventDate),
      eventLink: input.eventLink,
      title: input.title,
      description: input.description,
      content: input.content,
      coverImage: input.coverImage ? (input.coverImage as ImageBlock) : undefined,
      status: input.status as EventStatus | undefined
    };

    return eventService.updateEvent(id, serviceInput);
  },

  publishEvent: async (_: unknown, { id }: IdArgs, context: GraphQLContext): Promise<Event> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { eventService } = context.requestContainer.cradle;
    return eventService.publishEvent(id);
  },

  unpublishEvent: async (_: unknown, { id }: IdArgs, context: GraphQLContext): Promise<Event> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { eventService } = context.requestContainer.cradle;
    return eventService.unpublishEvent(id);
  },

  archiveEvent: async (_: unknown, { id }: IdArgs, context: GraphQLContext): Promise<Event> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { eventService } = context.requestContainer.cradle;
    return eventService.archiveEvent(id);
  },

  hideEvent: async (_: unknown, { id }: IdArgs, context: GraphQLContext): Promise<Event> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { eventService } = context.requestContainer.cradle;
    return eventService.hideEvent(id);
  },

  markEditingEvent: async (_: unknown, { id }: IdArgs, context: GraphQLContext): Promise<Event> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { eventService } = context.requestContainer.cradle;
    return eventService.markEditingEvent(id);
  },

  deleteEvent: async (_: unknown, { id }: IdArgs, context: GraphQLContext): Promise<boolean> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { eventService } = context.requestContainer.cradle;
    return eventService.deleteEvent(id);
  },

  incrementEventViews: async (_: unknown, { id }: IdArgs, context: GraphQLContext): Promise<Event> => {
    const { eventService } = context.requestContainer.cradle;

    return eventService.incrementViews(id);
  }
};
