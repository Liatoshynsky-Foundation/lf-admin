import mongoose, {Model, Schema} from 'mongoose';

import { baseContentSchemaFields } from './commonSchemas';
import {EventsEntity} from '~/domain/entities/Events';
import {EventStatus} from '~/types/enums/common.enums';

const eventSchema = new Schema<EventsEntity>(
  {
    ...baseContentSchemaFields,
    eventLink: { type: String, required: true },
    content: {
      uk: { type: Object, required: true },
      en: { type: Object, required: true }
    },
    status: {
      type: String,
      required: true,
      enum: Array.from(Object.values(EventStatus))
    },
  },
  {
    timestamps: true,
    collection: 'events'
  }
);

const EventModel: Model<EventsEntity> = mongoose.models.Event || mongoose.model<EventsEntity>('Event', eventSchema);

export default EventModel;