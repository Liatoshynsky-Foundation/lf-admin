import mongoose, { Model, Schema } from 'mongoose';

import {
  localizedImageSchema,
  metaSchema,
  optionalTranslatedFieldSchema,
  translatedBooleanSchema,
  translatedFieldSchema,
  translatedFieldUnrequiredSchema
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
    number: { 
      type: Number, required: true, 
      set: (v: unknown) => (v != null ? Number(v) : v) 
    },
    title: { type: translatedFieldSchema, required: true },
    numberKind: { type: String, enum: ['op', 'sineop', 'compositions'], default: 'op' },
    name: { type: translatedFieldSchema, default: { uk: '', en: '' } },
    additionalText: { 
      type: String, 
      default: null, 
      set: (v: unknown) => (typeof v === 'string' ? v.trim() || null : v)
    },
    creationYear: { type: String, default: null },
    endYear: { type: String, default: null },
    datesNote: { type: String, default: null },
    genre: { type: translatedFieldUnrequiredSchema, default: null },

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
    blocksOrder: {
      type: [String],
      default: ['details', 'intro', 'photos', 'works', 'performances']
    },
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

opusSchema.index(
  { number: 1, numberKind: 1, additionalText: 1 },
  { unique: true, collation: { locale: 'uk', strength: 2 } }
);

const OpusModel: Model<Opus> = mongoose.models.Opus || mongoose.model<Opus>('Opus', opusSchema);

export default OpusModel;
