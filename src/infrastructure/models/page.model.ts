import mongoose, { Model, Schema } from 'mongoose';

import { PageStatus } from '~/back-shared/types/enums/common.enums';
import { BasePage } from '~/domain/entities/Page';

const pageBaseSchema = new Schema<BasePage>(
  {
    slug: { type: String, required: true, index: true, unique: true },
    title: {
      uk: { type: String, required: true },
      en: { type: String, required: true }
    },
    status: {
      type: String,
      enum: [PageStatus.Draft, PageStatus.Published] as const,
      required: true,
      default: PageStatus.Published
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
