import mongoose, { Model, Schema } from 'mongoose';

import { EventStatus } from '~/back-shared/types/enums/common.enums';
import { Event } from '~/domain/entities/Event';
import { translatedFieldSchema } from '~/infrastructure/models/commonSchemas';

const eventSchema = new Schema(
  {
    eventDate: { type: Date, default: null },
    eventLink: { type: String, required: true },
    title: { type: translatedFieldSchema, required: true },
    description: { type: translatedFieldSchema, required: false },
    content: {
      uk: { type: Object, required: true },
      en: { type: Object, required: true }
    },
    slug: { type: String, required: true, unique: true, index: true },
    coverImage: {
      src: { type: String, required: true },
      alt: { type: translatedFieldSchema, required: true },
      caption: { type: translatedFieldSchema, required: true },
      isTmp: { type: Boolean, default: false }
    },
    status: {
      type: String,
      enum: [
        EventStatus.Draft,
        EventStatus.Published,
        EventStatus.Hidden,
        EventStatus.Archived,
        EventStatus.Editing
      ] as const,
      required: true,
      default: EventStatus.Draft
    },
    visits: {
      views: { type: Number, default: 0, required: true }
    }
  },
  {
    timestamps: true,
    collection: 'events'
  }
);

const EventModel: Model<Event> = mongoose.models.Event || mongoose.model<Event>('Event', eventSchema);

export default EventModel;
