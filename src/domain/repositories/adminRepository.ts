import { Admin } from '~/domain/entities/Admin';

export interface AdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
}
