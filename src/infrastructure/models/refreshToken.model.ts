import mongoose from 'mongoose';

import { adminTypes } from '~/back-constants/index';

const refreshTokenSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Admin' },
    adminType: { type: String, required: true, enum: adminTypes },
    jti: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.models.RefreshToken ?? mongoose.model('RefreshToken', refreshTokenSchema);
