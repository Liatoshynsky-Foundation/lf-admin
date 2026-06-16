import type { AdminRepository as AdminRepositoryType } from '~/domain/repositories/adminRepository';
import dbConnect from '~/infrastructure/db/connect';
import { Admin } from '~/infrastructure/models/admin.model';

export const AdminRepository = (): AdminRepositoryType => ({
  findByEmail: async (email: string) => {
    await dbConnect();
    const admin = await Admin.findOne({ email });
    if (!admin) return null;
    return admin;
  },
  setResetToken: async (adminId: string, token: string, expires: Date) => {
    await dbConnect();
    await Admin.findByIdAndUpdate(adminId, {
      resetPasswordToken: token,
      resetPasswordExpires: expires
    });
  },
  findByResetToken: async (token: string) => {
    await dbConnect();
    const admin = await Admin.findOne({ resetPasswordToken: token });
    return admin ? admin : null;
  },
  updatePasswordAndClearToken: async (adminId: string, hashedPassword: string) => {
    await dbConnect();
    await Admin.findByIdAndUpdate(adminId, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });
  }
});
