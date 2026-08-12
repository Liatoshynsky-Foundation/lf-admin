import mongoose, { Schema } from 'mongoose';

import { BaseContentStatuses } from '~/types/enums/common.enums';

const fondSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { uk: String, en: String },
    documentCreationDate: String,
    chronologicalBoundaries: { type: String, required: false },
    organizationForm: { type: String, required: false },
    characterAndContent: { type: String, required: false },

    numberOfCases: { type: Number, required: true, default: 0 },
    numberOfDescriptions: { type: Number, required: true, default: 0 },

    status: {
      type: String,
      required: true,
      enum: Array.from(Object.values(BaseContentStatuses)),
      default: BaseContentStatuses.Hidden
    },
    number: {
      uk: { type: String, required: false },
      en: { type: String, required: false }
    },
    documentLanguages: { type: String, required: false },
    accessConditions: { type: String, required: false },
    compilerInfo: { type: String, required: false }
  },
  {
    timestamps: true,
    collection: 'funds'
  }
);


const FondModel = mongoose.models.Fond || mongoose.model('Fond', fondSchema);

export default FondModel;