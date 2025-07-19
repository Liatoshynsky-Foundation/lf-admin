import mongoose from 'mongoose';

import { adminTypes } from '~/back-constants/index';

const adminSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: adminTypes },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

export const Admin = mongoose.models.Admin ?? mongoose.model('Admin', adminSchema);
