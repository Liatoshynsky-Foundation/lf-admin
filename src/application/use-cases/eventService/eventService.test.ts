import { extractImageSrcs } from '../extractImageSrc/extractImageSrc';
import { removeTmpFlagsRecursively } from '../removeTmpFlags/removeTmpFlags';
import { CreateEventServiceInput, EventService, UpdateEventServiceInput } from './eventService';
import { baseEvent, makeCreateEventInput, makeUpdateEventInput } from './eventService.test-factories';
import { eventServiceErrors } from '~/back-constants/errors';
import { EventStatus } from '~/back-shared/types/enums/common.enums';
import { generateUniqueSlug } from '~/back-shared/utils/slugGenerator/slugGenerator';
import { EventRepository } from '~/domain/repositories/eventRepository';

jest.mock('~/back-shared/utils/slugGenerator/slugGenerator', () => ({
  generateUniqueSlug: jest.fn()
}));

const mockedCopyBlobsToNewFolder = jest.fn();

jest.mock('../uploadService/upload', () => ({
  __esModule: true,
  blobStorageService: jest.fn(() => ({
    copyBlobsToNewFolder: mockedCopyBlobsToNewFolder
  }))
}));

jest.mock('../extractImageSrc/extractImageSrc', () => ({
  extractImageSrcs: jest.fn(() => [])
}));

jest.mock('../removeTmpFlags/removeTmpFlags', () => ({
  removeTmpFlagsRecursively: jest.fn((x) => x)
}));

const mockedGenerateUniqueSlug = generateUniqueSlug as jest.MockedFunction<typeof generateUniqueSlug>;
const mockedExtractImageSrcs = extractImageSrcs as jest.MockedFunction<typeof extractImageSrcs>;
const mockedRemoveTmpFlagsRecursively = removeTmpFlagsRecursively as jest.MockedFunction<
  typeof removeTmpFlagsRecursively
>;

describe('EventService', () => {
  let mockEventRepository: jest.Mocked<EventRepository>;
  let eventService: ReturnType<typeof EventService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockEventRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      incrementViews: jest.fn()
    };

    eventService = EventService({ eventRepository: mockEventRepository });
  });

  describe('createEvent', () => {
    it('should create event with default status, generate slug and copy the tmp image', async () => {
      const input: CreateEventServiceInput = makeCreateEventInput();

      mockedGenerateUniqueSlug.mockResolvedValue('testova-podiya');

      mockedExtractImageSrcs.mockReturnValueOnce(['img1-from-content']).mockReturnValueOnce([]);

      (mockEventRepository.create as jest.Mock).mockResolvedValue({
        ...baseEvent,
        ...input,
        slug: 'testova-podiya',
        status: EventStatus.Draft,
        visits: { views: 0 }
      });

      const result = await eventService.createEvent(input);

      expect(mockedGenerateUniqueSlug).toHaveBeenCalledWith('Тестова подія', {
        checkExists: expect.any(Function)
      });

      expect(mockedCopyBlobsToNewFolder).toHaveBeenCalledWith(
        'tmp',
        'photos',
        expect.arrayContaining(['tmp/test-image.jpg', 'img1-from-content'])
      );

      expect(mockedExtractImageSrcs).toHaveBeenCalledTimes(2);
      expect(mockedExtractImageSrcs).toHaveBeenCalledWith(input.content.uk);
      expect(mockedExtractImageSrcs).toHaveBeenCalledWith(input.content.en);

      expect(mockedRemoveTmpFlagsRecursively).toHaveBeenCalledTimes(3);
      expect(mockedRemoveTmpFlagsRecursively).toHaveBeenCalledWith(input.coverImage);
      expect(mockedRemoveTmpFlagsRecursively).toHaveBeenCalledWith(input.content.uk);
      expect(mockedRemoveTmpFlagsRecursively).toHaveBeenCalledWith(input.content.en);

      expect(mockEventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'testova-podiya',
          status: EventStatus.Draft
        })
      );

      expect(result.slug).toBe('testova-podiya');
      expect(result.status).toBe(EventStatus.Draft);
    });

    it('should throw error if title.uk is empty', async () => {
      const input: CreateEventServiceInput = makeCreateEventInput({
        title: {
          uk: '',
          en: 'Test'
        },
        description: undefined,
        content: {
          uk: {} as any,
          en: {} as any
        },
        coverImage: {
          src: 'tmp/image.jpg',
          alt: { uk: '', en: '' },
          caption: { uk: '', en: '' },
          isTmp: true
        }
      });

      await expect(eventService.createEvent(input)).rejects.toThrow(eventServiceErrors.TITLE_REQUIRED_FOR_SLUG);
      expect(mockEventRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if eventLink is empty', async () => {
      const input: CreateEventServiceInput = makeCreateEventInput({
        eventLink: '',
        description: undefined,
        content: {
          uk: {} as any,
          en: {} as any
        },
        coverImage: {
          src: 'tmp/image.jpg',
          alt: { uk: '', en: '' },
          caption: { uk: '', en: '' },
          isTmp: true
        }
      });

      await expect(eventService.createEvent(input)).rejects.toThrow(eventServiceErrors.EVENT_LINK_REQUIRED);
      expect(mockEventRepository.create).not.toHaveBeenCalled();
    });

    it('should create event with custom status', async () => {
      const input: CreateEventServiceInput = makeCreateEventInput({
        coverImage: baseEvent.coverImage,
        status: EventStatus.Published
      });

      mockedGenerateUniqueSlug.mockResolvedValue('testova-podiya');
      (mockEventRepository.create as jest.Mock).mockResolvedValue({
        ...baseEvent,
        ...input,
        slug: 'testova-podiya'
      });

      const result = await eventService.createEvent(input);

      expect(mockEventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'testova-podiya',
          status: EventStatus.Published
        })
      );
      expect(result.status).toBe(EventStatus.Published);
    });
  });

  describe('getEventById', () => {
    it('should return event by id', async () => {
      mockEventRepository.findById.mockResolvedValue(baseEvent);

      const result = await eventService.getEventById(baseEvent.id);

      expect(mockEventRepository.findById).toHaveBeenCalledWith(baseEvent.id);
      expect(result).toEqual(baseEvent);
    });

    it('should return null if event not found', async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      const result = await eventService.getEventById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('getEventBySlug', () => {
    it('should return event by slug', async () => {
      mockEventRepository.findBySlug.mockResolvedValue(baseEvent);

      const result = await eventService.getEventBySlug('test-event');

      expect(mockEventRepository.findBySlug).toHaveBeenCalledWith('test-event');
      expect(result).toEqual(baseEvent);
    });

    it('should throw error if event not found', async () => {
      mockEventRepository.findBySlug.mockResolvedValue(null);

      await expect(eventService.getEventBySlug('missing-slug')).rejects.toThrow(
        eventServiceErrors.EVENT_NOT_FOUND_BY_SLUG('missing-slug')
      );
    });
  });

  describe('getAllEvents', () => {
    it('should return all events without filters', async () => {
      mockEventRepository.findAll.mockResolvedValue([baseEvent]);

      const result = await eventService.getAllEvents();

      expect(mockEventRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([baseEvent]);
    });

    it('should return all events with filters', async () => {
      const filters = { status: EventStatus.Published, limit: 10 };
      mockEventRepository.findAll.mockResolvedValue([baseEvent]);

      const result = await eventService.getAllEvents(filters);

      expect(mockEventRepository.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual([baseEvent]);
    });
  });

  describe('getEventsCount', () => {
    it('should return events count without filters', async () => {
      mockEventRepository.count.mockResolvedValue(5);

      const result = await eventService.getEventsCount();

      expect(mockEventRepository.count).toHaveBeenCalledWith(undefined);
      expect(result).toBe(5);
    });

    it('should return events count with filters', async () => {
      mockEventRepository.count.mockResolvedValue(2);

      const result = await eventService.getEventsCount({ status: EventStatus.Published });

      expect(mockEventRepository.count).toHaveBeenCalledWith({ status: EventStatus.Published });
      expect(result).toBe(2);
    });
  });

  describe('getPublishedEvents', () => {
    it('should return only published events', async () => {
      mockEventRepository.findAll.mockResolvedValue([baseEvent]);

      const result = await eventService.getPublishedEvents();

      expect(mockEventRepository.findAll).toHaveBeenCalledWith({
        status: EventStatus.Published
      });
      expect(result).toEqual([baseEvent]);
    });

    it('should return only published events with additional filters', async () => {
      const filters = { limit: 5, sortBy: 'eventDate' as const };
      mockEventRepository.findAll.mockResolvedValue([baseEvent]);

      const result = await eventService.getPublishedEvents(filters);

      expect(mockEventRepository.findAll).toHaveBeenCalledWith({
        ...filters,
        status: EventStatus.Published
      });
      expect(result).toEqual([baseEvent]);
    });
  });

  describe('updateEvent', () => {
    it('should update event without title change', async () => {
      const updateData: UpdateEventServiceInput = makeUpdateEventInput({
        eventDate: new Date('2025-02-01')
      });

      (mockEventRepository.update as jest.Mock).mockResolvedValue({
        ...baseEvent,
        ...updateData
      });

      const result = await eventService.updateEvent(baseEvent.id, updateData);

      expect(mockEventRepository.update).toHaveBeenCalledWith(baseEvent.id, expect.objectContaining(updateData));
      expect(result.eventDate).toEqual(updateData.eventDate);
    });

    it('should throw error if title.uk becomes empty on update', async () => {
      const updateData: UpdateEventServiceInput = makeUpdateEventInput({
        title: {
          uk: '',
          en: 'Updated event'
        }
      });

      mockEventRepository.findById.mockResolvedValue(baseEvent);

      await expect(eventService.updateEvent(baseEvent.id, updateData)).rejects.toThrow(
        eventServiceErrors.TITLE_REQUIRED_FOR_SLUG
      );

      expect(mockEventRepository.update).not.toHaveBeenCalled();
      expect(mockedGenerateUniqueSlug).not.toHaveBeenCalled();
    });

    it('should regenerate slug if title was changed', async () => {
      const updateData: UpdateEventServiceInput = makeUpdateEventInput({
        title: {
          uk: 'Оновлена подія',
          en: 'Updated event'
        }
      });

      mockEventRepository.findById.mockResolvedValue(baseEvent);
      mockedGenerateUniqueSlug.mockResolvedValue('onovlena-podiya');
      (mockEventRepository.update as jest.Mock).mockResolvedValue({
        ...baseEvent,
        ...updateData,
        slug: 'onovlena-podiya'
      });

      const result = await eventService.updateEvent(baseEvent.id, updateData);

      expect(mockEventRepository.findById).toHaveBeenCalledWith(baseEvent.id);
      expect(mockedGenerateUniqueSlug).toHaveBeenCalledWith('Оновлена подія', {
        checkExists: expect.any(Function)
      });
      expect(mockEventRepository.update).toHaveBeenCalledWith(
        baseEvent.id,
        expect.objectContaining({
          title: updateData.title,
          slug: 'onovlena-podiya'
        })
      );
      expect(result.slug).toBe('onovlena-podiya');
    });

    it('should throw error if event not found while updating title', async () => {
      const updateData: UpdateEventServiceInput = makeUpdateEventInput({
        title: {
          uk: 'Оновлена подія',
          en: 'Updated'
        }
      });

      mockEventRepository.findById.mockResolvedValue(null);

      await expect(eventService.updateEvent('nonexistent-id', updateData)).rejects.toThrow(
        eventServiceErrors.EVENT_NOT_FOUND('nonexistent-id')
      );
    });

    it('should process tmp images and copy them when updating cover/content', async () => {
      const updateData: UpdateEventServiceInput = makeUpdateEventInput({
        coverImage: {
          ...baseEvent.coverImage,
          src: 'tmp/updated.jpg',
          isTmp: true
        },
        content: {
          uk: {
            /* ... */
          } as any,
          en: {
            /* ... */
          } as any
        }
      });

      mockedExtractImageSrcs.mockReturnValueOnce(['img1-from-uk']).mockReturnValueOnce(['img2-from-en']);

      mockEventRepository.update.mockResolvedValue({
        ...baseEvent,
        ...updateData,
        coverImage: { ...baseEvent.coverImage, src: 'photos/updated.jpg', isTmp: false }
      });

      const result = await eventService.updateEvent(baseEvent.id, updateData);

      expect(mockedExtractImageSrcs).toHaveBeenCalledTimes(2);

      expect(mockedCopyBlobsToNewFolder).toHaveBeenCalledWith(
        'tmp',
        'photos',
        expect.arrayContaining(['tmp/updated.jpg', 'img1-from-uk', 'img2-from-en'])
      );

      expect(mockedRemoveTmpFlagsRecursively).toHaveBeenCalledWith(updateData.coverImage);
      expect(mockedRemoveTmpFlagsRecursively).toHaveBeenCalledWith(updateData.content!.uk);
      expect(mockedRemoveTmpFlagsRecursively).toHaveBeenCalledWith(updateData.content!.en);

      expect(result).toBeDefined();
    });
  });

  describe('publishEvent', () => {
    it('should publish event', async () => {
      mockEventRepository.findById.mockResolvedValue(baseEvent);
      (mockEventRepository.update as jest.Mock).mockResolvedValue({
        ...baseEvent,
        status: EventStatus.Published
      });

      const result = await eventService.publishEvent(baseEvent.id);

      expect(mockEventRepository.update).toHaveBeenCalledWith(baseEvent.id, {
        status: EventStatus.Published
      });
      expect(result.status).toBe(EventStatus.Published);
    });

    it('should throw error if event not found', async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(eventService.publishEvent('nonexistent-id')).rejects.toThrow(
        eventServiceErrors.EVENT_NOT_FOUND('nonexistent-id')
      );
    });

    it('should throw error if update returns null', async () => {
      mockEventRepository.findById.mockResolvedValue(baseEvent);
      (mockEventRepository.update as jest.Mock).mockResolvedValue(null as any);

      await expect(eventService.publishEvent(baseEvent.id)).rejects.toThrow(
        eventServiceErrors.FAILED_TO_PUBLISH(baseEvent.id)
      );
    });
  });

  describe('unpublishEvent', () => {
    it('should make event a draft', async () => {
      mockEventRepository.findById.mockResolvedValue(baseEvent);
      (mockEventRepository.update as jest.Mock).mockResolvedValue({
        ...baseEvent,
        status: EventStatus.Draft
      });

      const result = await eventService.unpublishEvent(baseEvent.id);

      expect(mockEventRepository.update).toHaveBeenCalledWith(baseEvent.id, {
        status: EventStatus.Draft
      });
      expect(result.status).toBe(EventStatus.Draft);
    });

    it('should throw error if event not found', async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(eventService.unpublishEvent('missing-id')).rejects.toThrow(
        eventServiceErrors.EVENT_NOT_FOUND('missing-id')
      );
    });

    it('should throw error if update returns null', async () => {
      mockEventRepository.findById.mockResolvedValue(baseEvent);
      mockEventRepository.update.mockResolvedValue(null as any);

      await expect(eventService.unpublishEvent(baseEvent.id)).rejects.toThrow(
        eventServiceErrors.FAILED_TO_UNPUBLISH(baseEvent.id)
      );
    });
  });

  describe('archiveEvent', () => {
    it('should archive the event', async () => {
      mockEventRepository.findById.mockResolvedValue(baseEvent);
      (mockEventRepository.update as jest.Mock).mockResolvedValue({
        ...baseEvent,
        status: EventStatus.Archived
      });

      const result = await eventService.archiveEvent(baseEvent.id);

      expect(mockEventRepository.update).toHaveBeenCalledWith(baseEvent.id, {
        status: EventStatus.Archived
      });
      expect(result.status).toBe(EventStatus.Archived);
    });

    it('should throw error if event not found', async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(eventService.archiveEvent('missing-id')).rejects.toThrow(
        eventServiceErrors.EVENT_NOT_FOUND('missing-id')
      );
    });

    it('should throw error if update returns null', async () => {
      mockEventRepository.findById.mockResolvedValue(baseEvent);
      mockEventRepository.update.mockResolvedValue(null as any);

      await expect(eventService.archiveEvent(baseEvent.id)).rejects.toThrow(
        eventServiceErrors.FAILED_TO_ARCHIVE(baseEvent.id)
      );
    });
  });

  describe('hideEvent', () => {
    it('should hide the event', async () => {
      mockEventRepository.findById.mockResolvedValue(baseEvent);
      (mockEventRepository.update as jest.Mock).mockResolvedValue({
        ...baseEvent,
        status: EventStatus.Hidden
      });

      const result = await eventService.hideEvent(baseEvent.id);

      expect(mockEventRepository.update).toHaveBeenCalledWith(baseEvent.id, {
        status: EventStatus.Hidden
      });
      expect(result.status).toBe(EventStatus.Hidden);
    });

    it('should throw error if event not found', async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(eventService.hideEvent('missing-id')).rejects.toThrow(
        eventServiceErrors.EVENT_NOT_FOUND('missing-id')
      );
    });

    it('should throw error if update returns null', async () => {
      mockEventRepository.findById.mockResolvedValue(baseEvent);
      mockEventRepository.update.mockResolvedValue(null as any);

      await expect(eventService.hideEvent(baseEvent.id)).rejects.toThrow(
        eventServiceErrors.FAILED_TO_HIDE(baseEvent.id)
      );
    });
  });

  describe('markEditingEvent', () => {
    it('should make an event status Editing', async () => {
      mockEventRepository.findById.mockResolvedValue(baseEvent);
      (mockEventRepository.update as jest.Mock).mockResolvedValue({
        ...baseEvent,
        status: EventStatus.Editing
      });

      const result = await eventService.markEditingEvent(baseEvent.id);

      expect(mockEventRepository.update).toHaveBeenCalledWith(baseEvent.id, {
        status: EventStatus.Editing
      });
      expect(result.status).toBe(EventStatus.Editing);
    });

    it('should throw error if event not found', async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(eventService.markEditingEvent('missing-id')).rejects.toThrow(
        eventServiceErrors.EVENT_NOT_FOUND('missing-id')
      );
    });

    it('should throw error if update returns null', async () => {
      mockEventRepository.findById.mockResolvedValue(baseEvent);
      (mockEventRepository.update as jest.Mock).mockResolvedValue(null as any);

      await expect(eventService.markEditingEvent(baseEvent.id)).rejects.toThrow(
        eventServiceErrors.FAILED_TO_SET_EDITING(baseEvent.id)
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete the event', async () => {
      mockEventRepository.delete.mockResolvedValue(true);

      const result = await eventService.deleteEvent(baseEvent.id);

      expect(mockEventRepository.delete).toHaveBeenCalledWith(baseEvent.id);
      expect(result).toBe(true);
    });

    it('should throw error if delete failed', async () => {
      mockEventRepository.delete.mockResolvedValue(false);

      await expect(eventService.deleteEvent('nonexistent-id')).rejects.toThrow(
        'Failed to delete Event: nonexistent-id'
      );
    });
  });

  describe('getPaginatedEvents', () => {
    it('should return paginated events', async () => {
      mockEventRepository.findAll.mockResolvedValue([baseEvent]);
      mockEventRepository.count.mockResolvedValue(25);

      const result = await eventService.getPaginatedEvents(1, 10);

      expect(mockEventRepository.findAll).toHaveBeenCalledWith({
        limit: 10,
        skip: 0
      });
      expect(mockEventRepository.count).toHaveBeenCalledWith(undefined);
      expect(result).toEqual({
        events: [baseEvent],
        total: 25,
        page: 1,
        totalPages: 3
      });
    });

    it('should return correct page number by skip', async () => {
      mockEventRepository.findAll.mockResolvedValue([baseEvent]);
      mockEventRepository.count.mockResolvedValue(25);

      const result = await eventService.getPaginatedEvents(2, 10);

      expect(mockEventRepository.findAll).toHaveBeenCalledWith({
        limit: 10,
        skip: 10
      });
      expect(result.page).toBe(2);
    });

    it('should call with filters', async () => {
      const filters = { status: EventStatus.Published };
      mockEventRepository.findAll.mockResolvedValue([baseEvent]);
      mockEventRepository.count.mockResolvedValue(10);

      await eventService.getPaginatedEvents(1, 5, filters);

      expect(mockEventRepository.findAll).toHaveBeenCalledWith({
        ...filters,
        limit: 5,
        skip: 0
      });
      expect(mockEventRepository.count).toHaveBeenCalledWith(filters);
    });
  });

  describe('incrementViews', () => {
    it('should increment event views', async () => {
      const updatedEvent = {
        ...baseEvent,
        visits: { views: baseEvent.visits.views + 1 }
      };

      mockEventRepository.incrementViews.mockResolvedValue(updatedEvent);

      const result = await eventService.incrementViews(baseEvent.id);

      expect(mockEventRepository.incrementViews).toHaveBeenCalledWith(baseEvent.id);
      expect(result.visits.views).toBe(updatedEvent.visits.views);
    });

    it('should throw error if event not found', async () => {
      mockEventRepository.incrementViews.mockResolvedValue(null as any);

      await expect(eventService.incrementViews('nonexistent-id')).rejects.toThrow(
        eventServiceErrors.EVENT_NOT_FOUND('nonexistent-id')
      );
      expect(mockEventRepository.incrementViews).toHaveBeenCalledWith('nonexistent-id');
    });
  });
});
