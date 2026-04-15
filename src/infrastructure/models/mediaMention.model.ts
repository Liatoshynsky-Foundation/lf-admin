import mongoose, { Schema } from 'mongoose';

import { MediaMentionEntity } from '~/domain/entities/MediaMentions';
import { baseContentSchemaFields } from '~/infrastructure/models/commonSchemas';
import { MediaStatus } from '~/types/enums/common.enums';

const mediaMentionSchema = new Schema<MediaMentionEntity>(
  {
    ...baseContentSchemaFields,
    url: { type: String, required: true, unique: true },
    status: {
      type: String,
      required: true,
      enum: Array.from(Object.values(MediaStatus))
    }
  },
  {
    timestamps: true,
    collection: 'mediamentions'
  }
);

export const MediaMentionModel =
  mongoose.models.MediaMention ?? mongoose.model<MediaMentionEntity>('MediaMention', mediaMentionSchema);
