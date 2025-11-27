import { extractImageSrcs } from '~/application/use-cases/extractImageSrc/extractImageSrc';
import { removeTmpFlagsRecursively } from '~/application/use-cases/removeTmpFlags/removeTmpFlags';
import { blobStorageService } from '~/application/use-cases/uploadService/upload';
import type { CreateEventDTO, EventFilters, UpdateEventDTO } from '~/back-shared/types/events/types';
import { generateUniqueSlug } from '~/back-shared/utils/slugGenerator/slugGenerator';
import type { Event } from '~/domain/entities/Event';
import type { EventRepository } from '~/domain/repositories/eventRepository';
import { Event as EventModel } from '~/infrastructure/models/event.model';
import { EventStatus } from '~/types/enums/common.enums';

type Repo = EventRepository;

export const EventService = ({ eventRepository }: { eventRepository: Repo }) => ({
  getAll: async (filters?: EventFilters): Promise<Event[]> => {
    return eventRepository.findAll(filters);
  },

  getById: async (id: string): Promise<Event | null> => {
    return eventRepository.findById(id);
  },

  getBySlug: async (slug: string): Promise<Event | null> => {
    return eventRepository.findBySlug(slug);
  },

  create: async (dto: CreateEventDTO): Promise<Event> => {
    if (!dto.title?.uk || !dto.title?.en) {
      throw new Error('Title is required in both languages');
    }

    if (!dto.eventLink) {
      throw new Error('Event link is required');
    }

    const imageSrcs = dto.coverImage.isTmp ? [dto.coverImage.src] : [];
    imageSrcs.push(...extractImageSrcs(dto.content.uk));
    imageSrcs.push(...extractImageSrcs(dto.content.en));
    if (imageSrcs.length) {
      await blobStorageService().copyBlobsToNewFolder('tmp', 'photos', imageSrcs);
    }

    const cleanedDto = {
      ...dto,
      coverImage: removeTmpFlagsRecursively(dto.coverImage),
      content: {
        uk: removeTmpFlagsRecursively(dto.content.uk),
        en: removeTmpFlagsRecursively(dto.content.en)
      }
    };

    if (!cleanedDto.slug) {
      cleanedDto.slug = await generateUniqueSlug(dto.title.uk, {
        checkExists: async (slug: string) => {
          const existing = await EventModel.findOne({ slug }).lean();
          return !!existing;
        }
      });
    }

    return eventRepository.create(cleanedDto);
  },

  update: async (id: string, dto: UpdateEventDTO): Promise<Event> => {
    const existingEvent = await eventRepository.findById(id);
    if (!existingEvent) {
      throw new Error(`Event with id ${id} not found`);
    }

    if (dto.coverImage) {
      const imageSrcs = dto.coverImage.isTmp ? [dto.coverImage.src] : [];
      if (imageSrcs.length) {
        await blobStorageService().copyBlobsToNewFolder('tmp', 'photos', imageSrcs);
      }
    }
    if (dto.content) {
      const ukImageSrcs = extractImageSrcs(dto.content.uk);
      const enImageSrcs = extractImageSrcs(dto.content.en);
      const allImageSrcs = [...ukImageSrcs, ...enImageSrcs];
      if (allImageSrcs.length) {
        await blobStorageService().copyBlobsToNewFolder('tmp', 'photos', allImageSrcs);
      }
    }

    const cleanedDto: UpdateEventDTO = { ...dto };
    if (dto.coverImage) {
      cleanedDto.coverImage = removeTmpFlagsRecursively(dto.coverImage);
    }
    if (dto.content) {
      cleanedDto.content = {
        uk: removeTmpFlagsRecursively(dto.content.uk),
        en: removeTmpFlagsRecursively(dto.content.en)
      };
    }

    return eventRepository.update(id, cleanedDto);
  },

  delete: async (id: string): Promise<boolean> => {
    const existingEvent = await eventRepository.findById(id);
    if (!existingEvent) {
      throw new Error(`Event with id ${id} not found`);
    }

    return eventRepository.delete(id);
  },

  publish: async (id: string): Promise<Event> => {
    const event = await eventRepository.findById(id);
    if (!event) {
      throw new Error(`Event with id ${id} not found`);
    }

    if (event.status === EventStatus.Published) {
      throw new Error('Event is already published');
    }

    return eventRepository.update(id, { status: EventStatus.Published });
  },

  archive: async (id: string): Promise<Event> => {
    return eventRepository.update(id, { status: EventStatus.Archived });
  },

  incrementViews: async (id: string): Promise<void> => {
    await eventRepository.incrementViews(id);
  }
});
