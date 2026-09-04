import { Contacts } from '~/domain/entities/Contacts';

export interface IContactsRepository {
  findContacts(): Promise<Contacts | null>;
}
