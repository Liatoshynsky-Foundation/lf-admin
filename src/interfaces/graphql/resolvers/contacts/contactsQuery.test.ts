import { GraphQLError } from 'graphql';

import { validInput } from './__mock__/contacts';
import { ContactsQuery } from './contactsQuery';
import { contactsErrors } from '~/back-constants/errors';
import type { Contacts } from '~/domain/entities/Contacts';
import type { IContactsRepository } from '~/domain/repositories/contactsRepository';
import { createMockContext } from '~/interfaces/graphql/resolvers/testUtils';

const contacts: Contacts = validInput;

describe('ContactsQuery', () => {
  const findContacts = jest.fn<Promise<Contacts | null>, []>();
  const repository: jest.Mocked<Partial<IContactsRepository>> = { findContacts };
  const authorizedContext = createMockContext(true, 'contactsRepository', repository);
  const unauthorizedContext = createMockContext(false, 'contactsRepository', repository);

  beforeEach(() => jest.clearAllMocks());

  describe('contacts', () => {
    it('returns contacts from the repository', async () => {
      findContacts.mockResolvedValue(contacts);

      await expect(ContactsQuery.contacts({}, {}, authorizedContext)).resolves.toEqual(contacts);
      expect(findContacts).toHaveBeenCalledTimes(1);
    });

    it('throws a not-found GraphQLError when contacts are missing', async () => {
      findContacts.mockResolvedValue(null);

      await expect(ContactsQuery.contacts({}, {}, authorizedContext)).rejects.toEqual(
        new GraphQLError(contactsErrors.CONTACTS_NOT_FOUND, { extensions: { code: 'CONTACTS_NOT_FOUND' } })
      );
    });

    it('rejects unauthorized users before accessing the repository', async () => {
      await expect(ContactsQuery.contacts({}, {}, unauthorizedContext)).rejects.toMatchObject({
        extensions: { code: 'UNAUTHENTICATED' }
      });
      expect(findContacts).not.toHaveBeenCalled();
    });
  });
});
