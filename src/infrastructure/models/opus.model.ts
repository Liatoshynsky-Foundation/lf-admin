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

// Lenient description sub-schema: uk/en optional so existing lean docs and
// partially-filled admin SEO data both stay valid.
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
    // Canonical lf-client fields (shared collection).
    number: { type: String, required: true, unique: true, index: true },
    title: { type: translatedFieldSchema, required: true },
    releaseYear: { type: Number, default: null },

    // Admin extensions — all optional, no new unique indexes, so the existing
    // lean `opus` documents written by lf-client remain valid.
    numberKind: { type: String, enum: ['op', 'woo'], default: 'op' },
    name: { type: String, default: null },
    additionalText: { type: String, default: null },
    creationYear: { type: String, default: null },
    endYear: { type: String, default: null },
    datesNote: { type: String, default: null },
    genre: { type: String, default: null },

    adminTitle: { type: String, default: null },
    slug: { type: String, default: null },
    description: { type: opusDescriptionSchema, default: null },
    keywords: { type: optionalTranslatedFieldSchema, default: null },
    allowIndexation: { type: translatedBooleanSchema, default: null },
    coverImage: { type: localizedImageSchema, default: null },
    status: {
      type: String,
      enum: Array.from(Object.values(OpusStatus)),
      default: OpusStatus.Draft
    },
    meta: {
      views: { type: Number, default: 0 }
    }
  },
  { timestamps: true, collection: 'opus' }
);

const OpusModel: Model<Opus> = mongoose.models.Opus || mongoose.model<Opus>('Opus', opusSchema);

export default OpusModel;
