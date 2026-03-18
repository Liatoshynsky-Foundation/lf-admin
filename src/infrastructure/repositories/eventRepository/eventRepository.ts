import mongoose, { Model } from 'mongoose';

import { createBaseRepository } from '../baseRepository/baseRepository';
import { EventsEntity } from '~/domain/entities/Events';
import { CreateEventInput, EventFilters, IEventsRepository } from '~/domain/repositories/eventsRepository';
import dbConnect from '~/infrastructure/db/connect';
import {buildBaseQuery, createToEntity, getBaseSort} from '~/infrastructure/repositories/helpers';
import { EventStatus } from '~/types/enums/common.enums';

export type DbEvent = {
    _id: { toString(): string };
    eventLink: string;
    publishedAt: string | null;
    title: EventsEntity['title'];
    adminTitle: EventsEntity['adminTitle'];
    description: EventsEntity['description'];
    keywords: EventsEntity['keywords'];
    allowIndexation: EventsEntity['allowIndexation'];
    content: EventsEntity['content'];
    slug: string;
    coverImage: EventsEntity['coverImage'];
    status: EventStatus;
    meta: EventsEntity['meta'];
    createdAt: string;
    updatedAt: string;
};

type EventRepoDeps = Readonly<{
    EventModel: Model<DbEvent>;
}>;

const toEntity = (doc: DbEvent): EventsEntity =>
  createToEntity<EventsEntity, DbEvent>(doc, {
    eventLink: doc.eventLink,
    adminTitle: doc.adminTitle,
    title: doc.title,
    description: doc.description,
    keywords: doc.keywords,
    allowIndexation: doc.allowIndexation,
    slug: doc.slug,
    content: doc.content,
    coverImage: doc.coverImage,
    status: doc.status,
    meta: doc.meta,
    publishedAt: doc.publishedAt ?? undefined,
  });

export const EventsRepository = ({ EventModel }: EventRepoDeps): IEventsRepository => {
  const baseRepo = createBaseRepository<EventsEntity, DbEvent, EventFilters>({
    model: EventModel,
    toEntity,
    buildQuery: buildBaseQuery,
    getDefaultSort: getBaseSort
  });

  return {
    ...baseRepo,
    create: async (input: CreateEventInput): Promise<EventsEntity> => {
      await dbConnect();
      const eventData = {
        ...input,
        meta: { views: input.meta?.views ?? 0 }
      };
      const newEvent = await new EventModel(eventData).save();
      return toEntity(newEvent.toObject() as unknown as DbEvent);
    },
    incrementViews: async (id: string): Promise<EventsEntity | null> => {
      await dbConnect();
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const updated = await EventModel.findByIdAndUpdate(
        id,
        { $inc: { 'meta.views': 1 } },
        { new: true }
      ).lean<DbEvent>();
      return updated ? toEntity(updated) : null;
    }
  };
};