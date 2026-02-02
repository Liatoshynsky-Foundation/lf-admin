import mongoose, { Schema } from 'mongoose';

import { MediaMentionEntity, MediaStatus } from '~/domain/entities/MediaMentions';

const mediaMentionSchema = new Schema<MediaMentionEntity>(
  {
    url: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    coverImage: { type: Object, required: true },
    status: { type: String, required: true, enum: Array.from(Object.values(MediaStatus)) },
    meta: {
      views: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

export const MediaMentionModel =
  mongoose.models.MediaMention ?? mongoose.model<MediaMentionEntity>('MediaMention', mediaMentionSchema);
