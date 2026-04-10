import { endpointRepositoryHandler, mapFilters } from '../helpers';
import { EventsEntity } from '~/domain/entities/Events';
import { EventFilters } from '~/domain/repositories/eventsRepository';
import { EventStatus } from '~/types/enums/common.enums';

interface IdArgs { id: string }
interface SlugArgs { slug: string }
interface FilterArgs { filters?: Parameters<typeof mapFilters>[0] }
interface PaginatedArgs { page: number; limit: number; filters?: FilterArgs['filters'] }
interface CountArgs { status?: string }

const endpointHandler = endpointRepositoryHandler('eventsRepository');

export const EventsQuery = {
  eventById: endpointHandler<IdArgs, EventsEntity | null>(async ({ args: { id }, repo }) =>
    repo.findById(id)
  ),

  eventBySlug: endpointHandler<SlugArgs, EventsEntity | null>(async ({ args: { slug }, repo }) =>
    repo.findBySlug(slug)
  ),

  allEvents: endpointHandler<FilterArgs, EventsEntity[]>(async ({ args: { filters }, repo }) =>
    repo.findAll(mapFilters<EventFilters>(filters))
  ),

  publishedEvents: endpointHandler<FilterArgs, EventsEntity[]>(async ({ args: { filters }, repo }) =>
    repo.findAll(mapFilters<EventFilters>({ ...filters, statuses: [EventStatus.Published] }))
  ),

  paginatedEvents: endpointHandler<PaginatedArgs, { items: EventsEntity[]; total: number; page: number; totalPages: number }>(
    async ({ args: { page, limit, filters }, repo }) =>
      repo.findPaginated(page, limit, mapFilters<EventFilters>(filters))
  ),

  eventsCount: endpointHandler<CountArgs, number>(async ({ args: { status }, repo }) =>
    repo.count(status ? { statuses: [status as EventStatus] } : undefined)
  )
};