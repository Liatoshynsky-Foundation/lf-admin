import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ['admin', 'superadmin'] },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

export const Admin = mongoose.models.Admin ?? mongoose.model('Admin', adminSchema);
