import { FilterQuery, Model, Types } from 'mongoose';

import { createBaseRepository } from '../baseRepository/baseRepository';
import { EventStatus } from '~/back-shared/types/enums/common.enums';
import type { CreateEventDTO, EventFilters, UpdateEventDTO } from '~/back-shared/types/events/types';
import type { Event } from '~/domain/entities/Event';
import type { EventRepository as IEventRepository } from '~/domain/repositories/eventRepository';
import dbConnect from '~/infrastructure/db/connect';
import EventModel from '~/infrastructure/models/event.model';

type DbEvent = {
  _id: Types.ObjectId;
  eventDate: Date | null;
  eventLink: string;
  title: Event['title'];
  description?: Event['description'];
  content: Event['content'];
  slug: string;
  coverImage: Event['coverImage'];
  status: EventStatus;
  visits: Event['visits'];
  createdAt: Date | string;
  updatedAt: Date | string;
};

const toEntity = (doc: DbEvent): Event => ({
  id: doc._id.toString(),
  eventDate: doc.eventDate ?? null,
  eventLink: doc.eventLink,
  title: doc.title,
  description: doc.description,
  content: doc.content,
  slug: doc.slug,
  coverImage: doc.coverImage,
  status: doc.status,
  visits: doc.visits,
  createdAt: (doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt) as Event['createdAt'],
  updatedAt: (doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt) as Event['updatedAt']
});

const buildEventQuery = (filters?: Omit<EventFilters, 'limit' | 'skip' | 'sortBy' | 'sortOrder'>): FilterQuery<any> => {
  if (!filters) return {};

  const query: Record<string, unknown> = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.slug) {
    query.slug = filters.slug;
  }

  if (filters.search) {
    const regex = new RegExp(filters.search, 'i');
    query.$or = [{ 'title.uk': regex }, { 'title.en': regex }];
  }

  if (filters.dateFrom || filters.dateTo) {
    query.eventDate = {};
    if (filters.dateFrom) {
      (query.eventDate as any).$gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      (query.eventDate as any).$lte = filters.dateTo;
    }
  }

  return query;
};

const getEventSort = (filters?: EventFilters): Record<string, 1 | -1> => {
  const sortBy = filters?.sortBy ?? 'createdAt';
  const sortOrder = filters?.sortOrder ?? 'desc';

  return {
    [sortBy]: sortOrder === 'asc' ? 1 : -1
  };
};

const baseRepo = createBaseRepository<Event, DbEvent, EventFilters>({
  model: EventModel as unknown as Model<DbEvent>,
  toEntity,
  buildQuery: buildEventQuery,
  getDefaultSort: getEventSort
});

export const EventRepository = (): IEventRepository => ({
  findById: baseRepo.findById,
  findAll: baseRepo.findAll,
  delete: baseRepo.delete,
  count: baseRepo.count,

  update: async (id: string, dto: UpdateEventDTO): Promise<Event | null> => {
    return await baseRepo.update(id, dto as Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>);
  },

  create: async (dto: CreateEventDTO): Promise<Event> => {
    await dbConnect();

    const eventData = {
      ...dto,
      status: dto.status ?? EventStatus.Draft,
      visits: {
        views: 0
      }
    };

    const created = await new EventModel(eventData).save();
    return toEntity(created.toObject() as unknown as DbEvent);
  },

  findBySlug: async (slug: string): Promise<Event | null> => {
    await dbConnect();

    const doc = await EventModel.findOne({ slug }).lean<DbEvent>();
    return doc ? toEntity(doc) : null;
  },

  incrementViews: async (id: string): Promise<Event | null> => {
    await dbConnect();

    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const updated = await EventModel.findByIdAndUpdate(
      id,
      { $inc: { 'visits.views': 1 } },
      { new: true }
    ).lean<DbEvent>();

    return updated ? toEntity(updated) : null;
  }
});
