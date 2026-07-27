import mongoose, { Model, Schema } from 'mongoose';

import { BasePage } from '~/domain/entities/Page';
import { PageStatus } from '~/types/enums/common.enums';

const draftPageSchema = new Schema<BasePage>(
  {
    slug: { type: String, required: true, unique: true },
    title: {
      uk: { type: String, required: true },
      en: { type: String, required: true }
    },
    status: {
      type: String,
      enum: [PageStatus.Draft],
      required: true,
      default: PageStatus.Draft
    },
    blocks: { type: Schema.Types.Mixed, required: true },
    pageType: { type: String, required: true },
    blocksOrder: {
      type: [String],
      required: true,
      default: [] 
    }
  },
  {
    timestamps: true,
    collection: 'draftpages'
  }
);

export const DraftPageModel: Model<BasePage> =
  mongoose.models.DraftPage || mongoose.model<BasePage>('DraftPage', draftPageSchema);
