import mongoose, { Model, Schema } from 'mongoose';

import { BasePage } from '~/domain/entities/Page';
import { PageCategory, PageStatus } from '~/types/enums/common.enums';

const pageBaseSchema = new Schema<BasePage>(
  {
    slug: { type: String, required: true, index: true, unique: true },
    title: {
      uk: { type: String, required: true },
      en: { type: String, required: true }
    },
    category: {
      type: String,
      enum: PageCategory,
      required: true
    },
    description: {
      uk: { type: String, required: true },
      en: { type: String, required: true }
    },
    keywords: {
      uk: { type: String, required: false, default: '' },
      en: { type: String, required: false, default: '' }
    },
    canonicalUrl: {
      uk: { type: String, required: false },
      en: { type: String, required: false }
    },
    allowIndexation: {
      uk: { type: Boolean, required: true, default: true },
      en: { type: Boolean, required: true, default: true }
    },
    coverImage: {
      src: {
        type: String,
        required: true
      },
      alt: {
        type: String,
        required: true
      }
    },
    status: {
      type: String,
      enum: [PageStatus.Draft, PageStatus.Published] as const,
      required: true,
      default: PageStatus.Published
    },
    blocksOrder: {
      type: [String],
      required: true,
      default: []
    }
  },
  {
    timestamps: true,
    collection: 'pages',
    discriminatorKey: 'pageType'
  }
);

const PageModel: Model<BasePage> = mongoose.models.Page || mongoose.model<BasePage>('Page', pageBaseSchema);

const aboutUsDetailsSchema = new Schema({
  blocks: { type: Schema.Types.Mixed, required: true }
});

export const AboutUsPageModel =
  mongoose.models.AboutUsPage || PageModel.discriminator('AboutUsPage', aboutUsDetailsSchema);

export default PageModel;
