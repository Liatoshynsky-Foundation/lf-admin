import { LocalizedString } from '~/domain/entities/BaseContent';

export type Category = {
  id: string;
  key: string;
  name: LocalizedString;
  createdAt?: string;
  updatedAt?: string;
};
