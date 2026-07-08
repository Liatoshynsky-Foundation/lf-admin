import { LocalizedString } from '~/domain/entities/BaseContent';

export type Genre = {
  id: string;
  key: string;
  name: LocalizedString;
  createdAt?: string;
  updatedAt?: string;
};
