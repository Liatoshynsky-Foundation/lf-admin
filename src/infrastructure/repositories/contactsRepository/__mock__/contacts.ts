import type { DbBrandingInfo, DbContactInfo } from '../contactsRepository';
import type { UpdateContactsInput } from '~/domain/repositories/contactsRepository';

export const contactInfo: Omit<DbContactInfo, '_id'> = {
  slug: 'contact-info',
  address: { uk: 'Київ', en: 'Kyiv' },
  email: 'contact@example.com',
  phone: '+38 044 123 4567',
  socialLinks: [
    { icon: 'facebook', platform: 'Facebook', link: 'https://facebook.com/foundation' },
    { icon: 'youtube', platform: 'YouTube', link: 'https://youtube.com/foundation' }
  ],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-02'
};

export const brandingInfo: Omit<DbBrandingInfo, '_id'> = {
  slug: 'branding-info',
  foundationName: { uk: 'Фонд', en: 'Foundation' },
  supportButtonLink: 'https://example.com/support',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-02'
};

export const inputContactInformation: UpdateContactsInput['contactInformation'] = {
  foundationName: { uk: 'Новий фонд', en: 'New Foundation' },
  address: { uk: 'Львів', en: 'Lviv' },
  email: 'new@example.com',
  phone: '+38 032 123 4567'
};

export const socialNetworkData: NonNullable<DbContactInfo['socialLinks']> = [
  { icon: 'instagram', platform: 'Instagram', link: 'https://instagram.com/foundation' },
  { icon: 'anotherMedia', platform: 'Another Media', link: 'https://example.com/social' }
];

export const inputSocialNetworks: UpdateContactsInput['socialNetworks'] = socialNetworkData.map(
  ({ icon, link }) => ({ icon, link })
);

export const input: UpdateContactsInput = {
  contactInformation: inputContactInformation,
  socialNetworks: inputSocialNetworks
};
