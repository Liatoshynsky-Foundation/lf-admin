import mongoose, { Model, Schema } from 'mongoose';

import { pageSeoSchemaFields } from './commonSchemas';
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
    ...pageSeoSchemaFields,
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

const artistryDetailsSchema = new Schema({
  blocks: { type: Schema.Types.Mixed, required: true }
});

export const ArtistryPageModel =
  mongoose.models.ArtistryPage || PageModel.discriminator('ArtistryPage', artistryDetailsSchema);

const warInUkraineDetailsSchema = new Schema({
  blocks: { type: Schema.Types.Mixed, required: true }
});

export const WarInUkrainePageModel =
  mongoose.models.WarInUkrainePage || PageModel.discriminator('WarInUkrainePage', warInUkraineDetailsSchema);

const archiveDetailsSchema = new Schema({
  blocks: { type: Schema.Types.Mixed, required: true }
});

export const ArchivePageModel =
  mongoose.models.ArchivePage || PageModel.discriminator('ArchivePage', archiveDetailsSchema);
export const BIOGRAPHY_SECTION_TYPES = ['chronologyList', 'excerptBlockItem', 'OnlyImageBlock', 'fullWidthImage'] as const;

const biographySectionSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: BIOGRAPHY_SECTION_TYPES, required: true }
  },
  { _id: false, strict: false }
);

const biographyYearSchema = new Schema(
  {
    id: { type: String, required: true },
    yearTitle: { type: String, default: null },
    items: { type: [biographySectionSchema], default: [] }
  },
  { _id: false }
);

const biographyHeroSectionSchema = new Schema(
  {
    title: {
      uk: { type: String, required: true },
      en: { type: String, required: true }
    }
  },
  { _id: false, strict: false }
);

const biographyBlocksSchema = new Schema(
  {
    heroSection: { type: biographyHeroSectionSchema, required: true },
    biographyContent: { type: [biographyYearSchema], default: [] },
    LiatoshynskyOffice: { type: Schema.Types.Mixed }
  },
  { _id: false, strict: false }
);

const biographyDetailsSchema = new Schema({
  blocks: { type: biographyBlocksSchema, required: true }
});

export const BiographyPageModel =
  mongoose.models.BiographyPage || PageModel.discriminator('BiographyPage', biographyDetailsSchema);

export default PageModel;
