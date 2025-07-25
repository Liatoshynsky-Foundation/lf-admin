export interface Admin {
  id: string;
  type: 'admin' | 'superadmin';
  email: string;
  password: string;
}
