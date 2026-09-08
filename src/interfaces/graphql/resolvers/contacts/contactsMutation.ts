import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

import { endpointRepositoryHandler } from '../helpers';
import { contactsErrors } from '~/back-constants/errors';
import { Contacts } from '~/domain/entities/Contacts';
import { UpdateContactsInput } from '~/domain/repositories/contactsRepository';
import { zContactsSchema } from '~/validators/contacts.schema';

type UpdateContactsArgs = {
  input: UpdateContactsInput;
};

const endpointHandler = endpointRepositoryHandler('contactsRepository');

export const ContactsMutation = {
  updateContacts: endpointHandler<UpdateContactsArgs, Contacts>(async ({ args: { input }, repo }) => {
    let validatedInput: UpdateContactsInput;

    try {
      validatedInput = zContactsSchema.parse(input);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new GraphQLError('Invalid contacts input', {
          extensions: {
            code: 'CONTACTS_VALIDATION_ERROR',
            issues: error.issues
          }
        });
      }

      throw error;
    }

    try {
      const contacts = await repo.updateContacts(validatedInput);

      if (!contacts) {
        throw new GraphQLError(contactsErrors.CONTACTS_NOT_FOUND, {
          extensions: { code: 'CONTACTS_NOT_FOUND' }
        });
      }

      return contacts;
    } catch (error) {
      if (error instanceof Error && error.message === 'CONTACTS_NOT_FOUND') {
        throw new GraphQLError(contactsErrors.CONTACTS_NOT_FOUND, {
          extensions: { code: 'CONTACTS_NOT_FOUND' }
        });
      }

      throw error;
    }
  })
};
