import mongoose, { Model, Schema } from 'mongoose';

import { Fond } from '~/src/domain/entities/Fond';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const fondSchema = new Schema<Fond>(
  {
    fondNumber: { type: Number, required: true, unique: true },
    name: { type: String, required: true, index: true },
    documentCreationDate: { type: String, required: true },
    chronologicalBoundaries: { type: String, required: false },
    organizationForm: { type: String, required: false },
    description: { type: String, required: false },
    status: {
      type: String,
      required: true,
      enum: Array.from(Object.values(BaseContentStatuses))
    },
  },
  {
    timestamps: true,
    collection: 'fonds'
  }
);


const FondModel: Model<Fond> = mongoose.models.Fond || mongoose.model<Fond>('Fond', fondSchema);

export default FondModel;