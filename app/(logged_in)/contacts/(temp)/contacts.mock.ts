import { ContactsData } from '~/constants/contacts';

export const CONTACTS_MOCK = {
  contactInformation: {
    name: {
      uk: '«ФУНДАЦІЯ ЛЯТОШИНСЬКОГО»',
      en: 'LIATOSHYNSKY FOUNDATION'
    },
    location: {
      uk: 'м. Київ',
      en: 'Kyiv, Ukraine'
    },
    phone: '+380 000 000 001',
    email: 'liatoshynsky2@gmail.com',
  },
  socialNetworks: [
    {
      platform: 'facebook',
      link: 'https://facebook.com/'
    },
    {
      platform: 'instagram',
      link: 'https://instagram.com/'
    }
  ]
} satisfies ContactsData;
