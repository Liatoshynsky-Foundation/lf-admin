import mongoose from 'mongoose';

import { translatedFieldSchema } from '~/infrastructure/models/commonSchemas';
import { EventStatus } from '~/types/enums/common.enums';

const eventSchema = new mongoose.Schema(
  {
    eventLink: { type: String, required: true },
    title: { type: translatedFieldSchema, required: true },
    description: { type: translatedFieldSchema, required: false },
    content: {
      uk: { type: mongoose.Schema.Types.Mixed, required: true },
      en: { type: mongoose.Schema.Types.Mixed, required: true }
    },
    slug: { type: String, required: true, unique: true, index: true },
    coverImage: {
      src: { type: String, required: true },
      alt: { type: translatedFieldSchema, required: true },
      caption: { type: translatedFieldSchema, required: true },
      isTmp: { type: Boolean, required: false }
    },
    status: {
      type: String,
      enum: EventStatus,
      default: 'Draft'
    },
    visits: {
      views: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true,
    collection: 'events'
  }
);

export const Event = mongoose.models.Event ?? mongoose.model('Event', eventSchema);
