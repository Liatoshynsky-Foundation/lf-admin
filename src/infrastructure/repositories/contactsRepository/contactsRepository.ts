import type { Model } from 'mongoose';

import {
  Contacts,
  SOCIAL_NETWORK_PLATFORMS,
  SocialNetworkIcon,
  SocialNetworkPlatform
} from '~/domain/entities/Contacts';
import {
  IContactsRepository,
  UpdateContactsInput
} from '~/domain/repositories/contactsRepository';
import dbConnect from '~/infrastructure/db/connect';
import { withTransaction } from '~/infrastructure/repositories/helpers';
import { LocalizedString } from '~/types/common';

type DbSocialLink = {
  icon: SocialNetworkIcon;
  platform: SocialNetworkPlatform;
  link: string;
};

export type DbContactInfo = {
  _id: { toString(): string };
  slug: string;
  address: LocalizedString;
  email: string;
  phone: string;
  socialLinks?: DbSocialLink[];
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type DbBrandingInfo = {
  _id: { toString(): string };
  slug: string;
  foundationName: LocalizedString;
  supportButtonLink: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type ContactsRepositoryDeps = Readonly<{
  ContactInfo: Model<DbContactInfo>;
  BrandingInfo: Model<DbBrandingInfo>;
}>;

const CONTACT_INFO_SLUG = 'contact-info';
const BRANDING_INFO_SLUG = 'branding-info';

const findPlatform = (icon: SocialNetworkIcon) =>
  SOCIAL_NETWORK_PLATFORMS.find(({ icon: platformIcon }) => platformIcon === icon)!;

const toDbSocialLink = ({ icon, link }: Contacts['socialNetworks'][number]): DbSocialLink => {
  const platformData = findPlatform(icon);

  return {
    icon: platformData.icon,
    platform: platformData.platform,
    link
  };
};

const toEntity = (contactInfo: DbContactInfo, brandingInfo: DbBrandingInfo): Contacts => ({
  contactInformation: {
    foundationName: brandingInfo.foundationName,
    address: contactInfo.address,
    email: contactInfo.email,
    phone: contactInfo.phone
  },
  socialNetworks: (contactInfo.socialLinks ?? []).map(({ link, icon }) => ({
    icon,
    link
  }))
});

export const ContactsRepository = ({ ContactInfo, BrandingInfo }: ContactsRepositoryDeps): IContactsRepository => ({
  findContacts: async (): Promise<Contacts | null> => {
    await dbConnect();

    const [contactInfo, brandingInfo] = await Promise.all([
      ContactInfo.findOne({ slug: CONTACT_INFO_SLUG }).lean<DbContactInfo>().exec(),
      BrandingInfo.findOne({ slug: BRANDING_INFO_SLUG }).lean<DbBrandingInfo>().exec()
    ]);

    if (!contactInfo || !brandingInfo) return null;

    return toEntity(contactInfo, brandingInfo);
  },

  updateContacts: async (input: UpdateContactsInput): Promise<Contacts | null> =>
    withTransaction(async (session) => {
      const contactInfo = await ContactInfo.findOneAndUpdate(
        { slug: CONTACT_INFO_SLUG },
        {
          $set: {
            address: input.contactInformation.address,
            email: input.contactInformation.email,
            phone: input.contactInformation.phone,
            socialLinks: input.socialNetworks.map(toDbSocialLink)
          }
        },
        { new: true, runValidators: true, session }
      ).lean<DbContactInfo>().exec();

      if (!contactInfo) throw new Error('CONTACTS_NOT_FOUND');
      
      const brandingInfo = await BrandingInfo.findOneAndUpdate(
        { slug: BRANDING_INFO_SLUG },
        { $set: { foundationName: input.contactInformation.foundationName } },
        { new: true, runValidators: true, session }
      ).lean<DbBrandingInfo>().exec();

      if (!brandingInfo) throw new Error('CONTACTS_NOT_FOUND');

      return toEntity(contactInfo, brandingInfo);
    })
});
