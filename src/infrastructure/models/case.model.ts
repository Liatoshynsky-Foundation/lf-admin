import mongoose, { Model, Schema } from 'mongoose';

import { optionalTranslatedFieldSchema, translatedFieldSchema } from './commonSchemas';
import { Case } from '~/src/domain/entities/Case';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const casePdfFileSchema = new Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true }
  },
  { _id: false }
);

const caseSchema = new Schema(
  {
    fundId: { type: Schema.Types.ObjectId, ref: 'Fund', required: true, index: true },
    descriptionNumber: { type: Number, required: true, set: (v: unknown) => (v !== null && v !== undefined ? Number(v) : v) },
    caseNumber: { type: Number, required: true, set: (v: unknown) => (v !== null && v !== undefined ? Number(v) : v) },
    caseName: { type: translatedFieldSchema, required: true },
    caseDate: { type: translatedFieldSchema, required: true },
    sheetsNumber: { type: Number, required: true, set: (v: unknown) => (v !== null && v !== undefined ? Number(v) : v) },
    caseDescriptions: { type: translatedFieldSchema, required: true },
    detailedCaseDescription: { type: optionalTranslatedFieldSchema, default: null },
    pdfFile: { type: casePdfFileSchema, default: null },
    status: {
      type: String,
      required: true,
      enum: Array.from(Object.values(BaseContentStatuses)),
      default: BaseContentStatuses.Hidden
    }
  },
  {
    timestamps: true,
    collection: 'cases'
  }
);

caseSchema.index({ fundId: 1, descriptionNumber: 1, caseNumber: 1 }, { unique: true });

const CaseModel: Model<Case> = mongoose.models.Case || mongoose.model<Case>('Case', caseSchema);

export default CaseModel;
