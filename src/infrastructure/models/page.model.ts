import mongoose, { Model, Schema } from 'mongoose';

import { BasePage } from '~/domain/entities/Page';
import { PageStatus } from '~/types/enums/common.enums';

const pageBaseSchema = new Schema<BasePage>(
  {
    slug: { type: String, required: true, index: true },
    title: {
      uk: { type: String, required: true },
      en: { type: String, required: true }
    },
    status: {
      type: String,
      enum: [PageStatus.Draft, PageStatus.Published] as const,
      required: true,
      default: PageStatus.Draft
    }
  },
  {
    timestamps: true,
    collection: 'pages',
    discriminatorKey: 'pageType'
  }
);

pageBaseSchema.index({ slug: 1, status: 1 }, { unique: true });

const PageModel: Model<BasePage> = mongoose.models.Page || mongoose.model<BasePage>('Page', pageBaseSchema);

const aboutUsDetailsSchema = new Schema({
  blocks: { type: Schema.Types.Mixed, required: true }
});

export const AboutUsPageModel =
  mongoose.models.AboutUsPage || PageModel.discriminator('AboutUsPage', aboutUsDetailsSchema);

export default PageModel;
