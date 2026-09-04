import type { Model } from 'mongoose';

import {
  Contacts,
  SocialNetworkName,
  SocialNetworkPlatform
} from '~/domain/entities/Contacts';
import { IContactsRepository } from '~/domain/repositories/contactsRepository';
import dbConnect from '~/infrastructure/db/connect';
import { LocalizedString } from '~/types/common';

export type DbContactInfo = {
  _id: { toString(): string };
  slug: string;
  address: LocalizedString;
  email: string;
  phone: string;
  socialLinks?: Array<{
    icon: SocialNetworkPlatform;
    platform: SocialNetworkName;
    link: string;
  }>;
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

const toEntity = (contactInfo: DbContactInfo, brandingInfo: DbBrandingInfo): Contacts => ({
  contactInformation: {
    foundationName: brandingInfo.foundationName,
    address: contactInfo.address,
    email: contactInfo.email,
    phone: contactInfo.phone
  },
  socialNetworks: (contactInfo.socialLinks ?? []).map(({ link, icon }) => ({
    platform: icon,
    url: link,
  }))
});

export const ContactsRepository = ({ ContactInfo, BrandingInfo }: ContactsRepositoryDeps): IContactsRepository => ({
  findContacts: async (): Promise<Contacts | null> => {
    await dbConnect();

    const [contactInfo, brandingInfo] = await Promise.all([
      ContactInfo.findOne().lean<DbContactInfo>().exec(),
      BrandingInfo.findOne().lean<DbBrandingInfo>().exec()
    ]);

    if (!contactInfo || !brandingInfo) return null;

    return toEntity(contactInfo, brandingInfo);
  }
});
