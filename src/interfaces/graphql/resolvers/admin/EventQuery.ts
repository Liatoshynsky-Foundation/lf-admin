import { GraphQLError } from 'graphql';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { EventStatus } from '~/back-shared/types/enums/common.enums';
import { graphqlErrors } from '~/constants/errors';

type EventFiltersInput = {
  status?: string;
  slug?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

type EventFiltersArgs = { filters?: EventFiltersInput };
type PaginatedEventsArgs = { page?: number; limit?: number; filters?: EventFiltersInput };
type EventsCountArgs = { status?: EventStatus };

const mapFilters = (filters?: EventFiltersInput) => {
  if (!filters) return undefined;

  return {
    status: filters.status as EventStatus | undefined,
    slug: filters.slug,
    sortBy: filters.sortBy as ('createdAt' | 'updatedAt' | 'eventDate') | undefined,
    sortOrder: filters.sortOrder as 'asc' | 'desc' | undefined,
    search: filters.search,
    dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
    dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined
  };
};

export const EventQuery = {
  eventById: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { eventService } = context.requestContainer.cradle;

    return eventService.getEventById(id);
  },

  eventBySlug: async (_: unknown, { slug }: { slug: string }, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { eventService } = context.requestContainer.cradle;

    return eventService.getEventBySlug(slug);
  },

  allEvents: async (_: unknown, { filters }: EventFiltersArgs, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { eventService } = context.requestContainer.cradle;

    return eventService.getAllEvents(mapFilters(filters));
  },

  publishedEvents: async (_: unknown, { filters }: EventFiltersArgs, context: GraphQLContext) => {
    const { eventService } = context.requestContainer.cradle;

    return eventService.getPublishedEvents(mapFilters(filters));
  },

  paginatedEvents: async (
    _: unknown,
    { page = 1, limit = 10, filters }: PaginatedEventsArgs,
    context: GraphQLContext
  ) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { eventService } = context.requestContainer.cradle;

    return eventService.getPaginatedEvents(page, limit, mapFilters(filters));
  },

  eventsCount: async (_: unknown, { status }: EventsCountArgs, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { eventService } = context.requestContainer.cradle;

    return eventService.getEventsCount(status ? { status } : undefined);
  }
};
