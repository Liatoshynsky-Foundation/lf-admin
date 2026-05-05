import mongoose, { Model, Schema } from 'mongoose';

import { baseContentSchemaFields } from './commonSchemas';
import { EventsEntity } from '~/domain/entities/Events';
import { EventStatus } from '~/types/enums/common.enums';

const eventSchema = new Schema<EventsEntity>(
  {
    ...baseContentSchemaFields,
    eventLink: { type: String, required: true },
    content: {
      uk: { type: Object, required: true, default: {} },
      en: { type: Object, required: true, default: {} }
    },
    status: {
      type: String,
      required: true,
      enum: Array.from(Object.values(EventStatus))
    },
    eventDateTimeStart: {
      type: Date,
      default: null
    },
    eventDateTimeEnd: {
      type: Date,
      default: null
    },
    ticketUrl: {
      uk: { type: String, default: null },
      en: { type: String, default: null }
    }
  },
  {
    timestamps: true,
    collection: 'events'
  }
);

const EventModel: Model<EventsEntity> = mongoose.models.Event || mongoose.model<EventsEntity>('Event', eventSchema);

export default EventModel;