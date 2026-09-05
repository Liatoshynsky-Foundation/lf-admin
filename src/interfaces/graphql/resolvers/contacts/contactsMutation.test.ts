import { GraphQLError } from 'graphql';

import { validInput } from './__mock__/contacts';
import { ContactsMutation } from './contactsMutation';
import { contactsErrors, contactsValidationErrors } from '~/back-constants/errors';
import type { Contacts } from '~/domain/entities/Contacts';
import type { IContactsRepository, UpdateContactsInput } from '~/domain/repositories/contactsRepository';
import { createMockContext } from '~/interfaces/graphql/resolvers/testUtils';
import { zContactsSchema } from '~/validators/contacts.schema';

const updatedContacts = { ...validInput } as Contacts;

describe('ContactsMutation', () => {
  const updateContacts = jest.fn<Promise<Contacts | null>, [UpdateContactsInput]>();
  const repository: jest.Mocked<Partial<IContactsRepository>> = { updateContacts };
  const authorizedContext = createMockContext(true, 'contactsRepository', repository);
  const unauthorizedContext = createMockContext(false, 'contactsRepository', repository);

  beforeEach(() => jest.clearAllMocks());

  const expectValidationError = async (input: UpdateContactsInput, message: string) => {
    await expect(ContactsMutation.updateContacts({}, { input }, authorizedContext)).rejects.toMatchObject({
      message: 'Invalid contacts input',
      extensions: {
        code: 'CONTACTS_VALIDATION_ERROR',
        issues: expect.arrayContaining([expect.objectContaining({ message })])
      }
    });
    expect(updateContacts).not.toHaveBeenCalled();
  };

  describe('updateContacts', () => {
    it('validates, normalizes, and updates contacts', async () => {
      updateContacts.mockResolvedValue(updatedContacts);
      const input = {
        ...validInput,
        contactInformation: { ...validInput.contactInformation, email: ' contact@example.com ' }
      };

      await expect(ContactsMutation.updateContacts({}, { input }, authorizedContext)).resolves.toEqual(updatedContacts);
      expect(updateContacts).toHaveBeenCalledWith(validInput);
    });

    it('returns a not-found GraphQLError when the repository returns null', async () => {
      updateContacts.mockResolvedValue(null);

      await expect(ContactsMutation.updateContacts({}, { input: validInput }, authorizedContext)).rejects.toEqual(
        new GraphQLError(contactsErrors.CONTACTS_NOT_FOUND, { extensions: { code: 'CONTACTS_NOT_FOUND' } })
      );
    });

    it('maps the repository not-found sentinel to GraphQL', async () => {
      updateContacts.mockRejectedValue(new Error('CONTACTS_NOT_FOUND'));

      await expect(ContactsMutation.updateContacts({}, { input: validInput }, authorizedContext)).rejects.toEqual(
        new GraphQLError(contactsErrors.CONTACTS_NOT_FOUND, { extensions: { code: 'CONTACTS_NOT_FOUND' } })
      );
    });

    it('checks the localized foundation name schema rule inside the mutation', async () => {
      await expectValidationError(
        { ...validInput, contactInformation: { ...validInput.contactInformation, foundationName: { uk: ' ', en: 'Foundation' } } },
        contactsValidationErrors.LOCALIZED_FIELD_REQUIRED
      );
    });

    it('checks the email schema rule inside the mutation', async () => {
      await expectValidationError(
        { ...validInput, contactInformation: { ...validInput.contactInformation, email: 'invalid-email' } },
        contactsValidationErrors.EMAIL_INVALID
      );
    });

    it('checks the phone schema rule inside the mutation', async () => {
      await expectValidationError(
        { ...validInput, contactInformation: { ...validInput.contactInformation, phone: '+38 044 123' } },
        contactsValidationErrors.PHONE_INVALID
      );
    });

    it('checks the social network icon schema rule inside the mutation', async () => {
      await expectValidationError(
      { ...validInput, socialNetworks: [{ icon: 'unsupported', link: validInput.socialNetworks[0].link }] } as unknown as UpdateContactsInput,
      contactsValidationErrors.PLATFORM_INVALID
      );
    });

    it('checks the social network link schema rule inside the mutation', async () => {
      await expectValidationError(
        { ...validInput, socialNetworks: [{ icon: 'facebook', link: 'invalid-link' }] },
        contactsValidationErrors.LINK_INVALID
      );
    });

    it('rethrows unexpected validation errors', async () => {
      const error = new Error('unexpected validation error');
      const parse = jest.spyOn(zContactsSchema, 'parse').mockImplementationOnce(() => {
        throw error;
      });

      await expect(ContactsMutation.updateContacts({}, { input: validInput }, authorizedContext)).rejects.toBe(error);
      parse.mockRestore();
    });

    it('rejects unauthorized users before validation or persistence', async () => {
      await expect(ContactsMutation.updateContacts({}, { input: validInput }, unauthorizedContext)).rejects.toMatchObject({
        extensions: { code: 'UNAUTHENTICATED' }
      });
      expect(updateContacts).not.toHaveBeenCalled();
    });
  });
});
