import { ContactsData } from '../../constants/contacts';

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
    phone: {
      uk: '+380 000 000 001',
      en: '+380 000 000 002'
    },
    email: {
      uk: 'liatoshynsky1@gmail.com',
      en: 'liatoshynsky2@gmail.com'
    }
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
