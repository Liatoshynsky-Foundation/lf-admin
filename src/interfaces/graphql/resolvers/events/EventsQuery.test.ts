import { EventsQuery } from './EventsQuery';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import type { EventsRepository } from '~/domain/repositories/eventsRepository';
import { EventStatus, SortOrder } from '~/types/enums/common.enums';

describe('EventsQuery Resolvers', () => {
  const mockRepo: jest.Mocked<Partial<EventsRepository>> = {
    findAll: jest.fn(),
    findPaginated: jest.fn(),
    count: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn()
  };

  const context = {
    admin: true,
    requestContainer: {
      cradle: { eventsRepository: mockRepo as EventsRepository }
    }
  } as unknown as GraphQLContext;

  beforeEach(() => jest.clearAllMocks());

  it('allEvents: should map GQL filters to repository filters', async () => {
    await EventsQuery.allEvents({}, {
      filters: {
        sort: [{ field: 'adminTitle', order: SortOrder.Desc }]
      }
    }, context);

    expect(mockRepo.findAll).toHaveBeenCalledWith(expect.objectContaining({
      sort: [{ sortBy: 'adminTitle', sortOrder: SortOrder.Desc }]
    }));
  });

  it('publishedEvents: should force published status', async () => {
    await EventsQuery.publishedEvents({}, { filters: { status: 'draft' } }, context);
    expect(mockRepo.findAll).toHaveBeenCalledWith(expect.objectContaining({
      status: EventStatus.Published
    }));
  });

  it('eventsCount: should handle status filtering', async () => {
    await EventsQuery.eventsCount({}, { status: EventStatus.Archived }, context);
    expect(mockRepo.count).toHaveBeenCalledWith({ status: EventStatus.Archived });
  });

  it('paginatedEvents: should pass parameters correctly', async () => {
    const args = {
      page: 1,
      limit: 10,
      filters: { slug: 'test' }
    };
    await EventsQuery.paginatedEvents({}, args, context);
    expect(mockRepo.findPaginated).toHaveBeenCalledWith(1, 10, expect.objectContaining({ slug: 'test' }));
  });
});