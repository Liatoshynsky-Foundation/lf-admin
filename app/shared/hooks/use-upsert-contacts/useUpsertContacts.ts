import { useCallback } from 'react';

import type { ContactInformation, ContactsPayload, SocialNetworkFormItem } from '../../../constants/contacts';

type UpdateContactsInput = {
  contactInformation: ContactInformation;
  socialNetworks: SocialNetworkFormItem[];
};

export const useUpsertContacts = () => {
  const updateContacts = useCallback(({ contactInformation, socialNetworks }: UpdateContactsInput) => {
    const payload: ContactsPayload = {
      ...contactInformation,
      socialNetworks: socialNetworks.map(({ id: _id, ...socialNetwork }) => socialNetwork)
    };

    // Temporary POST placeholder
    // eslint-disable-next-line no-console
    console.log(payload);
  }, []);

  return { updateContacts };
};
