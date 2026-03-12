import {endpointRepositoryHandler, mapFilters} from '../helpers';
import { EventFilters } from '~/domain/repositories/eventsRepository';
import {EventStatus} from '~/types/enums/common.enums';

const endpointHandler = endpointRepositoryHandler('eventsRepository');

export const EventsQuery = {
  eventById: endpointHandler(async ({ args: { id }, repo }) => repo.findById(id)),
  eventBySlug: endpointHandler(async ({ args: { slug }, repo }) => repo.findBySlug(slug)),
  allEvents: endpointHandler(async ({ args: { filters }, repo }) => repo.findAll(mapFilters<EventFilters>(filters))),
  publishedEvents: endpointHandler(async ({ args: { filters }, repo }) =>
    repo.findAll(mapFilters<EventFilters>({ ...filters, status: EventStatus.Published }))
  ),
  paginatedEvents: endpointHandler(async ({ args: { page, limit, filters }, repo }) =>
    repo.findPaginated(page, limit, mapFilters<EventFilters>(filters))
  ),
  eventsCount: endpointHandler(async ({ args: { status }, repo }) =>
    repo.count(status ? { status: status as EventStatus } : undefined)
  )
};