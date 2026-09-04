import { Contacts } from '~/domain/entities/Contacts';

export type UpdateContactsInput = {
  contactInformation: Contacts['contactInformation'];
  socialNetworks: Contacts['socialNetworks'];
};

export interface IContactsRepository {
  findContacts(): Promise<Contacts | null>;
  updateContacts(input: UpdateContactsInput): Promise<Contacts | null>;
}
