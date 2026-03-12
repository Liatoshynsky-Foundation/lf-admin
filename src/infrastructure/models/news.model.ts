import mongoose, { Model, Schema } from 'mongoose';

import { News } from '~/domain/entities/News';
import {baseContentSchemaFields} from '~/infrastructure/models/commonSchemas';
import { NewsStatus } from '~/types/enums/common.enums';

const newsSchema = new Schema<News>(
  {
    ...baseContentSchemaFields,
    newsDate: { type: String, default: null },
    content: {
      uk: { type: Object, required: true },
      en: { type: Object, required: true }
    },
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
    }
  },
  {
    timestamps: true,
    collection: 'news'
  }
);

const NewsModel: Model<News> = mongoose.models.News || mongoose.model<News>('News', newsSchema);

export default NewsModel;
