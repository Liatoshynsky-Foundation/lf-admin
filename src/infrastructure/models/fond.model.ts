import mongoose, { Schema } from 'mongoose';

import { BaseContentStatuses } from '~/types/enums/common.enums';

const fondSchema = new Schema(
  {
    numberOfCases: { type: Number, required: true, default: 0 },
    numberOfDescriptions: { type: Number, required: true, default: 0 },
    id: { type: Number, required: true, unique: true },
    title: {
      uk: { type: String, required: true },
      en: { type: String, required: true }
    },
    documentCreationDate: { type: String, required: true },
    chronologicalBoundaries: { type: String, required: false },
    organizationForm: {
      uk: { type: String, required: false },
      en: { type: String, required: false }
    },
    characterAndContent: {
      uk: { 
        type: Object, 
        required: false, 
        default: {}
      },
      en: { 
        type: Object, 
        required: false, 
        default: {}
      }
    },
    status: {
      type: String,
      required: true,
      enum: Array.from(Object.values(BaseContentStatuses)),
      default: BaseContentStatuses.Hidden
    },
  },
  {
    timestamps: true,
    collection: 'funds'
  }
);

const FondModel = mongoose.models.Fond || mongoose.model('Fond', fondSchema);

export default FondModel;
