import mongoose, { Model, Schema } from 'mongoose';

import { News } from '~/domain/entities/News';
import { NewsStatus } from '~/types/enums/common.enums';

const newsSchema = new Schema<News>(
  {
    publishedAt: { type: Date, default: null },
    newsDate: { type: Date, default: null },
    title: {
      uk: { type: String, required: true },
      en: { type: String, required: true }
    },
    description: {
      uk: { type: String },
      en: { type: String }
    },
    content: {
      uk: { type: Object, required: true },
      en: { type: Object, required: true }
    },
    slug: { type: String, required: true, index: true, unique: true },
    coverImage: { type: String, required: true },
    status: {
      type: String,
      enum: [
        NewsStatus.Draft,
        NewsStatus.Published,
        NewsStatus.Hidden,
        NewsStatus.Archived,
        NewsStatus.Editing
      ] as const,
      required: true,
      default: NewsStatus.Draft
    },
    meta: {
      views: { type: Number, default: 0, required: true }
    }
  },
  {
    timestamps: true,
    collection: 'news'
  }
);

const NewsModel: Model<News> = mongoose.models.News || mongoose.model<News>('News', newsSchema);

export default NewsModel;
