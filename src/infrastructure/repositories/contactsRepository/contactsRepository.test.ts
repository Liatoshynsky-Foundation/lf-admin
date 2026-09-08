import type { Model } from 'mongoose';

import {
  brandingInfo,
  contactInfo,
  input,
  inputContactInformation,
  socialNetworkData,
} from './__mock__/contacts';
import type { DbBrandingInfo, DbContactInfo } from './contactsRepository';
import { ContactsRepository } from './contactsRepository';
import type { Contacts } from '~/domain/entities/Contacts';
import type { IContactsRepository } from '~/domain/repositories/contactsRepository';
import { withTransaction } from '~/infrastructure/repositories/helpers';

jest.mock('~/infrastructure/db/connect', () => jest.fn());
jest.mock('~/infrastructure/repositories/helpers', () => ({
  withTransaction: jest.fn((callback: (session: object) => Promise<unknown>) => callback({}))
}));

type Query<T> = {
  lean: jest.Mock<Query<T>, []>;
  exec: jest.Mock<Promise<T>, []>;
};

const query = <T>(value: T): Query<T> => {
  const result = {
    lean: jest.fn<Query<T>, []>(),
    exec: jest.fn<Promise<T>, []>().mockResolvedValue(value)
  };
  result.lean.mockReturnValue(result);
  return result;
};

const contactSocialNetworks = contactInfo.socialLinks!.map(({ icon, link }) => ({ icon, link }));

describe('ContactsRepository', () => {
  const contactFindOne = jest.fn();
  const brandingFindOne = jest.fn();
  const contactFindOneAndUpdate = jest.fn();
  const brandingFindOneAndUpdate = jest.fn();
  const MockContactInfo = {
    findOne: contactFindOne,
    findOneAndUpdate: contactFindOneAndUpdate
  } as unknown as Model<DbContactInfo>;
  const MockBrandingInfo = {
    findOne: brandingFindOne,
    findOneAndUpdate: brandingFindOneAndUpdate
  } as unknown as Model<DbBrandingInfo>;
  let repository: IContactsRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = ContactsRepository({
      ContactInfo: MockContactInfo,
      BrandingInfo: MockBrandingInfo
    });
  });

  describe('findContacts', () => {
    it('returns mapped contacts when both documents exist', async () => {
      contactFindOne.mockReturnValue(query(contactInfo));
      brandingFindOne.mockReturnValue(query(brandingInfo));

      await expect(repository.findContacts()).resolves.toEqual<Contacts>({
        contactInformation: {
          foundationName: brandingInfo.foundationName,
          address: contactInfo.address,
          email: contactInfo.email,
          phone: contactInfo.phone
        },
        socialNetworks: contactInfo.socialLinks?.map(({ icon, link }) => ({ icon, link })) ?? []
      });
    });

    it('returns null when contact information is missing', async () => {
      contactFindOne.mockReturnValue(query(null));
      brandingFindOne.mockReturnValue(query(brandingInfo));
      await expect(repository.findContacts()).resolves.toBeNull();
    });

    it('returns null when branding information is missing', async () => {
      contactFindOne.mockReturnValue(query(contactInfo));
      brandingFindOne.mockReturnValue(query(null));
      await expect(repository.findContacts()).resolves.toBeNull();
    });

    it('returns an empty social network list when links are absent', async () => {
      contactFindOne.mockReturnValue(query({ ...contactInfo, socialLinks: undefined }));
      brandingFindOne.mockReturnValue(query(brandingInfo));

      await expect(repository.findContacts()).resolves.toMatchObject({ socialNetworks: [] });
    });
  });

  describe('updateContacts', () => {
    it('updates contact and branding documents and returns mapped contacts', async () => {
      contactFindOneAndUpdate.mockReturnValue(query(contactInfo));
      brandingFindOneAndUpdate.mockReturnValue(query(brandingInfo));

      await expect(repository.updateContacts(input)).resolves.toMatchObject({
        contactInformation: { foundationName: brandingInfo.foundationName },
        socialNetworks: contactSocialNetworks
      });
      expect(withTransaction).toHaveBeenCalledTimes(1);
      expect(contactFindOneAndUpdate).toHaveBeenCalledWith(
        { slug: 'contact-info' },
        { $set: {
          address: inputContactInformation.address,
          email: inputContactInformation.email,
          phone: inputContactInformation.phone,
          socialLinks: socialNetworkData
        } },
        { new: true, runValidators: true, session: expect.anything() }
      );
      expect(brandingFindOneAndUpdate).toHaveBeenCalledWith(
        { slug: 'branding-info' },
        { $set: { foundationName: inputContactInformation.foundationName } },
        { new: true, runValidators: true, session: expect.anything() }
      );
    });

    it('throws when contact information cannot be updated', async () => {
      contactFindOneAndUpdate.mockReturnValue(query(null));

      await expect(repository.updateContacts(input)).rejects.toThrow('CONTACTS_NOT_FOUND');
      expect(brandingFindOneAndUpdate).not.toHaveBeenCalled();
    });

    it('throws when branding information cannot be updated', async () => {
      contactFindOneAndUpdate.mockReturnValue(query(contactInfo));
      brandingFindOneAndUpdate.mockReturnValue(query(null));

      await expect(repository.updateContacts(input)).rejects.toThrow('CONTACTS_NOT_FOUND');
    });
  });
});
