import type { UpdateContactsInput } from '~/domain/repositories/contactsRepository';

export const validInput: UpdateContactsInput = {
  contactInformation: {
    foundationName: { uk: 'Фонд', en: 'Foundation' },
    address: { uk: 'Київ', en: 'Kyiv' },
    email: 'contact@example.com',
    phone: '+380441234567'
  },
  socialNetworks: [{ icon: 'facebook', link: 'https://facebook.com/foundation' }]
};
