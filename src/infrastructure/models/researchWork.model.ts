import mongoose, { Model, Schema } from 'mongoose';

import { ResearchWork } from '~/src/domain/entities/ResearchWork';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const researchWorkPdfFileSchema = new Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true }
  },
  { _id: false }
);

const researchWorkSchema = new Schema(
  {
    bibliographicDescription: { type: String, required: true },
    author: { type: String, required: true },
    year: { type: String, required: true },
    keywords: { type: String, required: false },
    pdfFile: { type: researchWorkPdfFileSchema, default: null },
    url: { type: String, default: null },
    status: {
      type: String,
      required: true,
      enum: Array.from(Object.values(BaseContentStatuses)),
      default: BaseContentStatuses.Published
    },
    publishedAt: { type: Date, default: null }
  },
  { timestamps: true, collection: 'researchworks' }
);

const ResearchWorkModel: Model<ResearchWork> =
  mongoose.models.ResearchWork || mongoose.model<ResearchWork>('ResearchWork', researchWorkSchema);

export default ResearchWorkModel;
