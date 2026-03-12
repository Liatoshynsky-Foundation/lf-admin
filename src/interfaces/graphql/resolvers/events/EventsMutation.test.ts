import { EventsMutation } from './EventsMutation';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { EventsEntity } from '~/domain/entities/Events';
import type { CreateEventInput, IEventsRepository } from '~/domain/repositories/eventsRepository';
import { EventStatus } from '~/types/enums/common.enums';

jest.mock('~/src/shared/utils/slugGenerator/slugGenerator', () => ({
  generateUniqueSlug: jest.fn((title: string) =>
    Promise.resolve(`slug-${title.toLowerCase().replace(/\s+/g, '-')}`)
  )
}));

describe('EventsMutation Resolvers', () => {
  const mockRepo: jest.Mocked<Partial<IEventsRepository>> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    incrementViews: jest.fn()
  };

  const createTestContext = (isAdmin: boolean): GraphQLContext => ({
    admin: isAdmin,
    requestContainer: {
      cradle: {
        eventsRepository: mockRepo as IEventsRepository
      }
    }
  } as unknown as GraphQLContext);

  const adminContext = createTestContext(true);
  const userContext = createTestContext(false);

  const createMockEntity = (overrides: Partial<EventsEntity> = {}): EventsEntity => ({
    id: '1',
    adminTitle: 'Test',
    eventLink: 'https://test.com',
    title: { uk: 'Тест', en: 'Test' },
    description: { uk: 'Опис', en: 'Desc' },
    keywords: { uk: 'к', en: 'k' },
    allowIndexation: { uk: true, en: true },
    slug: 'slug-test',
    content: { uk: { blocks: [] }, en: { blocks: [] } } as EventsEntity['content'],
    coverImage: { src: '', alt: { uk: '', en: '' }, caption: { uk: '', en: '' } },
    status: EventStatus.Draft,
    meta: { views: 0 },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    ...overrides
  });

  const createMockInput = (overrides: Partial<CreateEventInput> = {}): Omit<CreateEventInput, 'slug'> => ({
    adminTitle: 'New Event',
    eventLink: 'https://link.com',
    title: { uk: 'Подія', en: 'Event' },
    description: { uk: 'Опис', en: 'Desc' },
    keywords: { uk: 'к', en: 'k' },
    allowIndexation: { uk: true, en: true },
    content: { uk: { blocks: [] }, en: { blocks: [] } } as EventsEntity['content'],
    coverImage: { src: '', alt: { uk: '', en: '' }, caption: { uk: '', en: '' } },
    status: EventStatus.Draft,
    meta: { views: 0 },
    ...overrides
  } as Omit<CreateEventInput, 'slug'>);

  beforeEach(() => jest.clearAllMocks());

  describe('Security/Authentication', () => {
    it('should throw UNAUTHENTICATED error message if context.admin is false', async () => {
      const input = createMockInput();
      await expect(EventsMutation.createEvent({}, { input }, userContext))
        .rejects.toThrow('You must be logged in to access this resource.');
    });
  });

  describe('Business Logic', () => {
    it('should create event with correct slug and status', async () => {
      const input = createMockInput();
      (mockRepo.findBySlug as jest.Mock).mockResolvedValue(null);
      (mockRepo.create as jest.Mock).mockResolvedValue(createMockEntity({ slug: 'slug-подія' }));

      const result = await EventsMutation.createEvent({}, { input }, adminContext);

      expect(result.slug).toBe('slug-подія');
      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        status: EventStatus.Draft
      }));
    });

    it('should update event and generate new slug if title changes', async () => {
      const id = '123';
      const updateInput = { title: { uk: 'Нова Назва', en: 'New Name' } };

      (mockRepo.findBySlug as jest.Mock).mockResolvedValue(null);
      (mockRepo.update as jest.Mock).mockResolvedValue(createMockEntity({ id, slug: 'slug-нова-назва' }));

      const result = await EventsMutation.updateEvent({}, { id, input: updateInput }, adminContext);

      expect(result.slug).toBe('slug-нова-назва');
      expect(mockRepo.update).toHaveBeenCalledWith(id, expect.objectContaining({ slug: 'slug-нова-назва' }));
    });

    it('should allow the same slug if it belongs to the event being updated', async () => {
      const id = '123';
      const updateInput = { title: { uk: 'Нова Назва', en: 'New Name' } };

      (mockRepo.findBySlug as jest.Mock).mockResolvedValue(createMockEntity({ id: '123', slug: 'slug-existing-title' }));
      (mockRepo.update as jest.Mock).mockResolvedValue(createMockEntity({ id, slug: 'slug-existing-title' }));

      await EventsMutation.updateEvent({}, { id, input: updateInput }, adminContext);

      expect(mockRepo.update).toHaveBeenCalled();
    });

    it('should default to Draft status if no status is provided', async () => {
      const input = createMockInput();
      const { status: _status, ...inputWithoutStatus } = input;

      (mockRepo.create as jest.Mock).mockResolvedValue(createMockEntity({ status: EventStatus.Draft }));

      await EventsMutation.createEvent({}, { input: inputWithoutStatus as any }, adminContext);

      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        status: EventStatus.Draft
      }));
    });
  });

  describe('Deletion and Metadata', () => {
    it('deleteEvent: should throw error if not admin', async () => {
      await expect(EventsMutation.deleteEvent({}, { id: '1' }, userContext))
        .rejects.toThrow('You must be logged in to access this resource.');
    });

    it('incrementEventViews: should call incrementViews and return result', async () => {
      const mockEvent = createMockEntity({ id: '1', meta: { views: 100 } });
      (mockRepo.incrementViews as jest.Mock).mockResolvedValue(mockEvent);

      const result = await EventsMutation.incrementEventViews({}, { id: '1' }, adminContext);

      expect(result!.meta.views).toBe(100);
      expect(mockRepo.incrementViews).toHaveBeenCalledWith('1');
    });

    it('deleteEvent: should call repo.delete if admin', async () => {
      (mockRepo.delete as jest.Mock).mockResolvedValue(true);

      const result = await EventsMutation.deleteEvent({}, { id: '1' }, adminContext);

      expect(mockRepo.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });
  });
});