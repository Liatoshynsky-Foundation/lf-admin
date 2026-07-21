import mongoose, { Model, Schema } from 'mongoose';

import {
  localizedImageSchema,
  metaSchema,
  optionalTranslatedFieldSchema,
  translatedBooleanSchema,
  translatedFieldSchema
} from './commonSchemas';
import { Opus } from '~/domain/entities/Opus';
import { OpusStatus } from '~/types/enums/common.enums';

const opusDescriptionSchema = new Schema(
  {
    uk: { type: String, default: '' },
    en: { type: String, default: '' },
    meta: metaSchema
  },
  { _id: false }
);

const opusSchema = new Schema(
  {
    number: { type: Number, required: true, unique: true, index: true, set: (v: unknown) => (v != null ? Number(v) : v) },
    title: { type: translatedFieldSchema, required: true },
    numberKind: { type: String, enum: ['op', 'sineop', 'compositions'], default: 'op' },
    name: { type: translatedFieldSchema, default: { uk: '', en: '' } },
    additionalText: { type: String, default: null },
    creationYear: { type: String, default: null },
    endYear: { type: String, default: null },
    datesNote: { type: String, default: null },
    genre: { type: String, default: null },

    adminTitle: { type: String, default: null },
    slug: { type: String, default: null },
    description: { type: opusDescriptionSchema, default: null },
    introDescription: {
      uk: { type: String, default: '' },
      en: { type: String, default: '' }
    },
    parts: {
      uk: { type: String, default: '' },
      en: { type: String, default: '' }
    },
    keywords: { type: optionalTranslatedFieldSchema, default: null },
    allowIndexation: { type: translatedBooleanSchema, default: null },
    coverImage: { type: localizedImageSchema, default: null },
    performancesTitle: { type: optionalTranslatedFieldSchema, default: null },
    gallery: [
      {
        src: { type: String, required: true },
        description: {
          uk: { type: String, default: '' },
          en: { type: String, default: '' }
        },
        altText: {
          uk: { type: String, default: '' },
          en: { type: String, default: '' }
        },
        crop: { type: Schema.Types.Mixed, default: null }
      }
    ],
    performances: [
      {
        title: {
          uk: { type: String, default: '' },
          en: { type: String, default: '' }
        },
        videoUrl: { type: String, default: '' },
      }
    ],
    status: {
      type: String,
      enum: Array.from(Object.values(OpusStatus)),
      default: OpusStatus.Draft
    },
    meta: {
      views: { type: Number, default: 0 }
    },
    compositions: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Composition' }],
      default: []
    }
  },
  { timestamps: true, collection: 'opus' }
);

const OpusModel: Model<Opus> = mongoose.models.Opus || mongoose.model<Opus>('Opus', opusSchema);

export default OpusModel;
