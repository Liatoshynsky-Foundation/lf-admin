import { Admin } from '~/domain/entities/Admin';

export interface AdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
  setResetToken: (adminId: string, token: string, expires: Date) => Promise<void>;
  findByResetToken: (token: string) => Promise<Admin | null>;
  updatePasswordAndClearToken: (adminId: string, hashedPassword: string) => Promise<void>;
}
