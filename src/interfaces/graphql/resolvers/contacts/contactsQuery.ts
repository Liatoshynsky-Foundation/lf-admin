import { GraphQLError } from 'graphql';

import { endpointRepositoryHandler } from '../helpers';
import { contactsErrors } from '~/back-constants/errors';
import { Contacts } from '~/domain/entities/Contacts';

const endpointHandler = endpointRepositoryHandler('contactsRepository');

export const ContactsQuery = {
  contacts: endpointHandler<Record<string, never>, Contacts>(async ({ repo }) => {
    const contacts = await repo.findContacts();

    if (!contacts) {
      throw new GraphQLError(contactsErrors.CONTACTS_NOT_FOUND, {
        extensions: { code: 'CONTACTS_NOT_FOUND' }
      });
    }

    return contacts;
  })
};
