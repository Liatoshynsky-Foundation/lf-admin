import { IEventsRepository } from '~/domain/repositories/eventsRepository';
import { createMockContext } from '~/interfaces/graphql/resolvers/testUtils';
import { EventStatus, SortOrder } from '~/types/enums/common.enums';

jest.mock('mongoose', () => {
  const mockSchema = jest.fn().mockImplementation(() => ({
    index: jest.fn()
  }));

  (mockSchema as unknown as Record<string, unknown>).Types = {
    ObjectId: String
  };

  return {
    Schema: mockSchema,
    Types: {
      ObjectId: jest.fn().mockImplementation(() => 'mocked-id')
    },
    model: jest.fn().mockReturnValue({}),
    models: {}
  };
});

jest.mock('~/infrastructure/models/imageCrop.model', () => ({
  ImageCropModel: {
    findOneAndUpdate: jest.fn()
  }
}));

import { EventsQuery } from './eventsQuery';

describe('EventsQuery Resolvers', () => {
  const mockRepo: jest.Mocked<Partial<IEventsRepository>> = {
    findAll: jest.fn(),
    findPaginated: jest.fn(),
    count: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn()
  };

  const context = createMockContext(true, 'eventsRepository', mockRepo);

  beforeEach(() => jest.clearAllMocks());

  it('allEvents: should map GQL filters to repository filters', async () => {
    await EventsQuery.allEvents(
      {},
      {
        filters: {
          sort: [{ field: 'adminTitle', order: SortOrder.Desc }]
        }
      },
      context
    );

    expect(mockRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: [{ sortBy: 'adminTitle', sortOrder: SortOrder.Desc }]
      })
    );
  });

  it('publishedEvents: should force published status', async () => {
    await EventsQuery.publishedEvents({}, { filters: { statuses: [EventStatus.Draft] } }, context);
    expect(mockRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        statuses: [EventStatus.Published]
      })
    );
  });

  it('eventsCount: should handle status filtering', async () => {
    await EventsQuery.eventsCount({}, { status: EventStatus.Archived }, context);
    expect(mockRepo.count).toHaveBeenCalledWith({ statuses: [EventStatus.Archived] });
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

  it('eventById: should find event by id', async () => {
    const id = 'test-id';
    await EventsQuery.eventById({}, { id }, context);

    expect(mockRepo.findById).toHaveBeenCalledWith(id);
  });

  it('eventBySlug: should find event by slug', async () => {
    const slug = 'test-slug';
    await EventsQuery.eventBySlug({}, { slug }, context);

    expect(mockRepo.findBySlug).toHaveBeenCalledWith(slug);
  });

  it('eventsCount: should handle undefined status', async () => {
    await EventsQuery.eventsCount({}, {}, context);

    expect(mockRepo.count).toHaveBeenCalledWith(undefined);
  });
});
