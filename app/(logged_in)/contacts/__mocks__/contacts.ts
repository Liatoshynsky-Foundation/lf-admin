import type { ContactInformation, ContactsData, ContactsLocale, SocialNetworkFormItem } from '~/constants/contacts';

export const CONTACT_INFORMATION: ContactInformation = {
  name: { uk: 'Фундація', en: 'Foundation' },
  location: { uk: 'Київ', en: 'Kyiv' },
  phone: '+380 000 000 001',
  email: 'foundation@example.com'
};

export const SOCIAL_NETWORKS: SocialNetworkFormItem[] = [
  { id: 0, platform: 'facebook', link: 'https://facebook.com/test' },
  { id: 1, platform: 'instagram', link: 'https://instagram.com/test' }
];

export const CONTACTS_DATA: ContactsData = {
  contactInformation: CONTACT_INFORMATION,
  socialNetworks: SOCIAL_NETWORKS.map(({ id: _id, ...item }) => item)
};

export const CONTACT_LOCALES = {
  uk: 'uk',
  en: 'en'
} satisfies Record<ContactsLocale, ContactsLocale>;
