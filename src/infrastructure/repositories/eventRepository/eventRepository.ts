import type { CreateEventDTO, EventFilters, UpdateEventDTO } from '~/back-shared/types/events/types';
import { generateUniqueSlug } from '~/back-shared/utils/slugGenerator/slugGenerator';
import type { Event } from '~/domain/entities/Event';
import type { EventRepository as IEventRepository } from '~/domain/repositories/eventRepository';
import { Event as EventModel } from '~/infrastructure/models/event.model';

const mapToEvent = (doc: any): Event => {
  return {
    id: doc._id.toString(),
    eventLink: doc.eventLink,
    title: doc.title,
    description: doc.description,
    content: doc.content,
    slug: doc.slug,
    coverImage: doc.coverImage,
    status: doc.status,
    visits: doc.visits,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
};

export const EventRepository = (): IEventRepository => ({
  findAll: async (filters?: EventFilters): Promise<Event[]> => {
    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.search) {
      query.$or = [
        { 'title.uk': { $regex: filters.search, $options: 'i' } },
        { 'title.en': { $regex: filters.search, $options: 'i' } }
      ];
    }

    const sortField = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder === 'asc' ? 1 : -1;

    const events = await EventModel.find(query)
      .sort({ [sortField]: sortOrder })
      .limit(filters?.limit || 100)
      .skip(filters?.offset || 0)
      .lean();

    return events.map(mapToEvent);
  },

  findById: async (id: string): Promise<Event | null> => {
    const event = await EventModel.findById(id).lean();
    return event ? mapToEvent(event) : null;
  },

  findBySlug: async (slug: string): Promise<Event | null> => {
    const event = await EventModel.findOne({ slug }).lean();
    return event ? mapToEvent(event) : null;
  },

  create: async (dto: CreateEventDTO): Promise<Event> => {
    const slug =
      dto.slug ||
      (await generateUniqueSlug(dto.title.uk, {
        checkExists: async (slug: string) => {
          const existing = await EventModel.findOne({ slug }).lean();
          return !!existing;
        }
      }));

    const event = await EventModel.create({
      ...dto,
      slug,
      status: dto.status || 'Draft',
      visits: { views: 0 }
    });

    return mapToEvent(event.toObject());
  },

  update: async (id: string, dto: UpdateEventDTO): Promise<Event> => {
    const event = await EventModel.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true }).lean();

    if (!event) {
      throw new Error(`Event with id ${id} not found`);
    }

    return mapToEvent(event);
  },

  delete: async (id: string): Promise<boolean> => {
    const result = await EventModel.findByIdAndDelete(id);
    return !!result;
  },

  incrementViews: async (id: string): Promise<void> => {
    await EventModel.findByIdAndUpdate(id, {
      $inc: { 'visits.views': 1 }
    });
  }
});
