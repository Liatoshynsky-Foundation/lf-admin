import { createBaseService } from '../baseService/baseService';
import { extractImageSrcs } from '../extractImageSrc/extractImageSrc';
import { removeTmpFlagsRecursively } from '../removeTmpFlags/removeTmpFlags';
import { blobStorageService } from '../uploadService/upload';
import { eventServiceErrors } from '~/back-constants/errors';
import { EventStatus } from '~/back-shared/types/enums/common.enums';
import type { CreateEventDTO, EventFilters, UpdateEventDTO } from '~/back-shared/types/events/types';
import { generateUniqueSlug } from '~/back-shared/utils/slugGenerator/slugGenerator';
import type { Event } from '~/domain/entities/Event';
import type { EventRepository } from '~/domain/repositories/eventRepository';

type Repo = EventRepository;

export type CreateEventServiceInput = Omit<CreateEventDTO, 'slug'>;

export type UpdateEventServiceInput = Omit<UpdateEventDTO, 'slug'>;

export const EventService = ({ eventRepository }: { eventRepository: Repo }) => {
  const baseService = createBaseService<Event, EventFilters>({
    repository: eventRepository,
    entityName: 'Event'
  });

  return {
    getEventById: baseService.getById,
    getAllEvents: baseService.getAll,
    getEventsCount: baseService.getCount,
    deleteEvent: baseService.delete,

    updateEvent: async (id: string, input: UpdateEventServiceInput): Promise<Event> => {
      const updateData: UpdateEventDTO = { ...input };

      if (input.title) {
        const event = await eventRepository.findById(id);
        if (!event) {
          throw new Error(eventServiceErrors.EVENT_NOT_FOUND(id));
        }

        const mergedTitle = {
          ...event.title,
          ...input.title
        };

        if (!mergedTitle.uk) {
          throw new Error(eventServiceErrors.TITLE_REQUIRED_FOR_SLUG);
        }

        updateData.title = mergedTitle;

        const titleForSlug = mergedTitle.uk;

        if (titleForSlug && titleForSlug !== event.title.uk) {
          updateData.slug = await generateUniqueSlug(titleForSlug, {
            checkExists: async (slug: string) => {
              const existing = await eventRepository.findBySlug(slug);
              return existing !== null && existing.id !== id;
            }
          });
        }
      }

      const tmpImages: string[] = [];

      if (input.coverImage?.isTmp) {
        tmpImages.push(input.coverImage.src);
      }

      if (input.content) {
        tmpImages.push(...extractImageSrcs(input.content.uk), ...extractImageSrcs(input.content.en));
      }

      if (tmpImages.length) {
        await blobStorageService().copyBlobsToNewFolder('tmp', 'photos', tmpImages);
      }

      if (input.coverImage) {
        updateData.coverImage = removeTmpFlagsRecursively(input.coverImage);
      }

      if (input.content) {
        updateData.content = {
          uk: removeTmpFlagsRecursively(input.content.uk),
          en: removeTmpFlagsRecursively(input.content.en)
        };
      }

      return baseService.update(id, updateData);
    },

    getPaginatedEvents: async (
      page: number = 1,
      limit: number = 10,
      filters?: Omit<EventFilters, 'limit' | 'skip'>
    ): Promise<{ events: Event[]; total: number; page: number; totalPages: number }> => {
      const result = await baseService.getPaginated(page, limit, filters);
      return {
        events: result.items,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      };
    },

    createEvent: async (input: CreateEventServiceInput): Promise<Event> => {
      const titleForSlug = typeof input.title === 'object' && 'uk' in input.title ? input.title.uk : '';

      if (!titleForSlug) {
        throw new Error(eventServiceErrors.TITLE_REQUIRED_FOR_SLUG);
      }

      if (!input.eventLink) {
        throw new Error(eventServiceErrors.EVENT_LINK_REQUIRED);
      }

      const slug = await generateUniqueSlug(titleForSlug, {
        checkExists: async (slug: string) => {
          const existing = await eventRepository.findBySlug(slug);
          return existing !== null;
        }
      });

      const tmpImages: string[] = [];

      if (input.coverImage?.isTmp) {
        tmpImages.push(input.coverImage.src);
      }

      tmpImages.push(...extractImageSrcs(input.content.uk), ...extractImageSrcs(input.content.en));

      if (tmpImages.length) {
        await blobStorageService().copyBlobsToNewFolder('tmp', 'photos', tmpImages);
      }

      const eventData: CreateEventDTO = {
        ...input,
        slug,
        status: input.status ?? EventStatus.Draft
      };

      eventData.coverImage = removeTmpFlagsRecursively(eventData.coverImage);
      eventData.content = {
        uk: removeTmpFlagsRecursively(eventData.content.uk),
        en: removeTmpFlagsRecursively(eventData.content.en)
      };

      return eventRepository.create(eventData);
    },

    getEventBySlug: async (slug: string): Promise<Event> => {
      const event = await eventRepository.findBySlug(slug);

      if (!event) {
        throw new Error(eventServiceErrors.EVENT_NOT_FOUND_BY_SLUG(slug));
      }

      return event;
    },

    getPublishedEvents: async (filters?: Omit<EventFilters, 'status'>): Promise<Event[]> => {
      return eventRepository.findAll({
        ...filters,
        status: EventStatus.Published
      });
    },

    publishEvent: async (id: string): Promise<Event> => {
      const event = await eventRepository.findById(id);
      if (!event) {
        throw new Error(eventServiceErrors.EVENT_NOT_FOUND(id));
      }

      const updateData: UpdateEventDTO = {
        status: EventStatus.Published
      };

      const updated = await eventRepository.update(id, updateData);
      if (!updated) {
        throw new Error(eventServiceErrors.FAILED_TO_PUBLISH(id));
      }

      return updated;
    },

    unpublishEvent: async (id: string): Promise<Event> => {
      const event = await eventRepository.findById(id);
      if (!event) {
        throw new Error(eventServiceErrors.EVENT_NOT_FOUND(id));
      }

      const updated = await eventRepository.update(id, {
        status: EventStatus.Draft
      });

      if (!updated) {
        throw new Error(eventServiceErrors.FAILED_TO_UNPUBLISH(id));
      }

      return updated;
    },

    archiveEvent: async (id: string): Promise<Event> => {
      const event = await eventRepository.findById(id);
      if (!event) {
        throw new Error(eventServiceErrors.EVENT_NOT_FOUND(id));
      }

      const updated = await eventRepository.update(id, {
        status: EventStatus.Archived
      });

      if (!updated) {
        throw new Error(eventServiceErrors.FAILED_TO_ARCHIVE(id));
      }

      return updated;
    },

    hideEvent: async (id: string): Promise<Event> => {
      const event = await eventRepository.findById(id);
      if (!event) {
        throw new Error(eventServiceErrors.EVENT_NOT_FOUND(id));
      }

      const updated = await eventRepository.update(id, {
        status: EventStatus.Hidden
      });

      if (!updated) {
        throw new Error(eventServiceErrors.FAILED_TO_HIDE(id));
      }

      return updated;
    },

    markEditingEvent: async (id: string): Promise<Event> => {
      const event = await eventRepository.findById(id);
      if (!event) {
        throw new Error(eventServiceErrors.EVENT_NOT_FOUND(id));
      }

      const updated = await eventRepository.update(id, {
        status: EventStatus.Editing
      });

      if (!updated) {
        throw new Error(eventServiceErrors.FAILED_TO_SET_EDITING(id));
      }

      return updated;
    },

    incrementViews: async (id: string): Promise<Event> => {
      const updated = await eventRepository.incrementViews(id);

      if (!updated) {
        throw new Error(eventServiceErrors.EVENT_NOT_FOUND(id));
      }

      return updated;
    }
  };
};
