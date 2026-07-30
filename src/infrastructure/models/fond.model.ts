import mongoose, { Model, Schema } from 'mongoose';

import { Fond } from '~/src/domain/entities/Fond';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const fondSchema = new Schema<Fond>(
  {
    fondNumber: { type: Number, required: true, unique: true },
    name: {
      uk: { type: String, required: true, unique: true },
      en: { type: String, required: true, unique: true}
    },
    documentCreationDate: {
      uk: { type: String, required: true },
      en: { type: String, required: true }
    },
    chronologicalBoundaries: {
      uk: { type: String, required: false },
      en: { type: String, required: false }
    },
    organizationForm: {
      uk: { type: String, required: false },
      en: { type: String, required: false }
    },
    description: { type: Schema.Types.Mixed, required: false },
    status: {
      type: String,
      required: true,
      enum: Array.from(Object.values(BaseContentStatuses)),
      default: BaseContentStatuses.Hidden
    },
  },
  {
    timestamps: true,
    collection: 'fonds'
  }
);


const FondModel: Model<Fond> = mongoose.models.Fond || mongoose.model<Fond>('Fond', fondSchema);

export default FondModel;