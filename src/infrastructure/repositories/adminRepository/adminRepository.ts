import type { AdminRepository as AdminRepositoryType } from '~/domain/repositories/adminRepository';
import dbConnect from '~/infrastructure/db/connect';
import { Admin } from '~/infrastructure/models/admin.model';

export const AdminRepository = (): AdminRepositoryType => ({
  findByEmail: async (email: string) => {
    await dbConnect();
    console.log(await Admin.find());
    const admin = await Admin.findOne({ email });
    if (!admin) return null;
    return admin;
  }
});
