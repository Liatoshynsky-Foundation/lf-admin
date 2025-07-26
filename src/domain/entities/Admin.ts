import { adminTypes } from '~/back-constants/index';

export interface Admin {
  id: string;
  type: adminTypes;
  email: string;
  password: string;
}
