import { Model} from 'mongoose';

import {DbEvent, EventsRepository} from './eventRepository';
import { EventsEntity } from '~/domain/entities/Events';
import {CreateEventInput, IEventsRepository} from '~/src/domain/repositories/eventsRepository';
import { EventStatus, SortOrder } from '~/types/enums/common.enums';

jest.mock('mongoose', () => ({
  Schema: jest.fn(),
  model: jest.fn(),
  Types: {
    ObjectId: {
      isValid: (id: string) => /^[0-9a-fA-F]{24}$/.test(id)
    }
  }
}));

jest.mock('~/src/infrastructure/db/connect', () => jest.fn());

interface MockQueryState {
    data: DbEvent[];
    sort: Record<string, number>;
    skip: number;
    limit: number;
}

interface MockQueryBuilder {
    state: MockQueryState;
    sort(this: MockQueryBuilder, sortObj: Record<string, number>): MockQueryBuilder;
    skip(this: MockQueryBuilder, val: number): MockQueryBuilder;
    limit(this: MockQueryBuilder, val: number): MockQueryBuilder;
    lean(this: MockQueryBuilder): Promise<DbEvent[]>;
}

interface DbEventMock extends Omit<EventsEntity, 'id'> {
    _id: { toString: () => string };
}

describe('EventsRepository - Advanced Filtering Logic', () => {
  const mockDbEventsExtended: DbEvent[] = [
    { _id: { toString: () => '1' }, adminTitle: 'C Event', status: EventStatus.Published, slug: 'event-c', createdAt: '2024-01-01' },
    { _id: { toString: () => '2' }, adminTitle: 'A Event', status: EventStatus.Draft, slug: 'event-a', createdAt: '2024-01-05' },
    { _id: { toString: () => '3' }, adminTitle: 'B Event', status: EventStatus.Published, slug: 'event-b', createdAt: '2024-01-03' },
  ] as unknown as DbEvent[];

  const findMock = jest.fn();
  const countDocumentsMock = jest.fn();

  const MockModel = {
    find: findMock,
    countDocuments: countDocumentsMock
  } as unknown as Model<DbEvent> & { countDocuments: jest.Mock };

  const repository = EventsRepository({ EventModel: MockModel });

  const setupPaginatedMock = (data: DbEvent[]): MockQueryBuilder => {
    const queryBuilder: MockQueryBuilder = {
      state: {
        data: [...data],
        sort: {},
        skip: 0,
        limit: data.length
      },
      sort: jest.fn().mockImplementation(function(this: MockQueryBuilder, sortObj: Record<string, number>) {
        this.state.sort = sortObj;
        return this;
      }),
      skip: jest.fn().mockImplementation(function(this: MockQueryBuilder, val: number) {
        this.state.skip = val;
        return this;
      }),
      limit: jest.fn().mockImplementation(function(this: MockQueryBuilder, val: number) {
        this.state.limit = val;
        return this;
      }),
      lean: jest.fn().mockImplementation(async function(this: MockQueryBuilder): Promise<DbEvent[]> {
        const result = [...this.state.data];

        if (Object.keys(this.state.sort).length > 0) {
          result.sort((a, b) => {
            for (const [field, order] of Object.entries(this.state.sort)) {
              const valA = (a as unknown as Record<string, string | number>)[field];
              const valB = (b as unknown as Record<string, string | number>)[field];
              if (valA === valB) continue;
              return valA > valB ? order : -order;
            }
            return 0;
          });
        }

        return result.slice(this.state.skip, this.state.skip + this.state.limit);
      })
    };
    findMock.mockReturnValue(queryBuilder);
    return queryBuilder;
  };

  it('should correctly apply combined status and slug filter', async () => {
    setupPaginatedMock(mockDbEventsExtended.filter(e => e.status === EventStatus.Published && e.slug === 'event-c'));

    const result = await repository.findAll({
      statuses: [EventStatus.Published],
      slug: 'event-c'
    });

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('event-c');
    expect(result[0].id).toBe('1');
    expect(findMock).toHaveBeenCalledWith({
      $and: [
        { status: { $in: [EventStatus.Published] } },
        { slug: 'event-c' }
      ]
    });
  });

  it('should sort filtered events by adminTitle ASC', async () => {
    setupPaginatedMock(mockDbEventsExtended.filter(e => e.status === EventStatus.Published));

    const result = await repository.findAll({
      statuses: [EventStatus.Published],
      sort: [{ sortBy: 'adminTitle', sortOrder: SortOrder.Asc }]
    });

    expect(result).toHaveLength(2);
    expect(result[0].adminTitle).toBe('B Event');
    expect(result[1].adminTitle).toBe('C Event');
  });

  it('should handle pagination on filtered and sorted results', async () => {
    countDocumentsMock.mockResolvedValue(2);

    setupPaginatedMock(mockDbEventsExtended.filter(e => e.status === EventStatus.Published));

    const result = await repository.findPaginated(2, 1, {
      statuses: [EventStatus.Published],
      sort: [{ sortBy: 'adminTitle', sortOrder: SortOrder.Asc }]
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('1');
    expect(result.total).toBe(2);
    expect(countDocumentsMock).toHaveBeenCalledWith({ status: { $in: [EventStatus.Published] } });
  });
});

describe('EventsRepository Comprehensive Tests', () => {
  const mockId = '65eddf5e2f1a2b3c4d5e6f7a';

  const createMockEventDoc = (overrides: Partial<DbEventMock> = {}): DbEventMock => ({
    _id: { toString: () => mockId },
    adminTitle: 'Test Event',
    eventLink: 'https://event.com',
    title: { uk: 'Івент', en: 'Event' },
    slug: 'test-event',
    content: { uk: { blocks: [] }, en: { blocks: [] } } as EventsEntity['content'],
    status: EventStatus.Published,
    coverImage: { src: 'img.jpg', alt: { uk: 'а', en: 'a' }, caption: { uk: '', en: '' } },
    description: { uk: 'Опис', en: 'Desc' },
    keywords: { uk: 'к', en: 'k' },
    allowIndexation: { uk: true, en: true },
    meta: { views: 10 },
    createdAt: '2026-03-10T10:00:00.000Z',
    updatedAt: '2026-03-11T12:00:00.000Z',
    ...overrides
  });

    type MockQuery = {
        sort: jest.Mock;
        skip: jest.Mock;
        limit: jest.Mock;
        lean: jest.Mock;
    };

    const findByIdAndUpdateMock = jest.fn();
    const findMock = jest.fn();
    const countDocumentsMock = jest.fn();
    const saveMock = jest.fn();

    const MockModel = jest.fn().mockImplementation(() => ({
      save: saveMock
    })) as unknown as Model<DbEvent> & {
        findByIdAndUpdate: jest.Mock;
        find: jest.Mock;
        countDocuments: jest.Mock;
    };

    MockModel.findByIdAndUpdate = findByIdAndUpdateMock;
    MockModel.find = findMock;
    MockModel.countDocuments = countDocumentsMock;

    let repository: IEventsRepository;

    beforeEach(() => {
      jest.clearAllMocks();
      repository = EventsRepository({ EventModel: MockModel });
    });

    describe('Filtering and Sorting', () => {
      const setupChain = (data: DbEventMock[]): MockQuery => {
        const query: MockQuery = {
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue(data)
        };
        findMock.mockReturnValue(query);
        return query;
      };

      it('should apply multiple sort criteria', async () => {
        const chain = setupChain([]);
        await repository.findAll({
          sort: [
            { sortBy: 'adminTitle', sortOrder: SortOrder.Asc },
            { sortBy: 'createdAt', sortOrder: SortOrder.Desc }
          ]
        });
        expect(chain.sort).toHaveBeenCalledWith({ adminTitle: 1, createdAt: -1 });
      });

      it('should filter by slug', async () => {
        setupChain([]);
        await repository.findAll({ slug: 'specific-event' });
        expect(findMock).toHaveBeenCalledWith(expect.objectContaining({ slug: 'specific-event' }));
      });
    });

    describe('Operations', () => {
      it('should increment views successfully', async () => {
        findByIdAndUpdateMock.mockReturnValue({
          lean: jest.fn().mockResolvedValue(createMockEventDoc({ meta: { views: 11 } }))
        });
        const result = await repository.incrementViews(mockId);
        expect(result?.meta.views).toBe(11);
      });

      it('should create new event with string dates', async () => {
        const input: CreateEventInput = {
          adminTitle: 'Created',
          eventLink: 'link',
          title: { uk: 'Заголовок', en: 'Title' },
          slug: 'created',
          content: { uk: { blocks: [] }, en: { blocks: [] } } as EventsEntity['content'],
          status: EventStatus.Draft,
          coverImage: { src: 'img.jpg', alt: { uk: 'а', en: 'a' }, caption: { uk: '', en: '' } },
          description: { uk: 'Опис', en: 'Desc' },
          keywords: { uk: 'к', en: 'k' },
          allowIndexation: { uk: true, en: true }
        };

        saveMock.mockResolvedValue({
          toObject: () => createMockEventDoc({ adminTitle: 'Created' })
        });

        const result = await repository.create(input);
        expect(result.adminTitle).toBe('Created');
        expect(typeof result.createdAt).toBe('string');
      });
    });
});