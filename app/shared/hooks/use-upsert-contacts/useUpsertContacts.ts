import toast from 'react-hot-toast';

import {
  type ContactInformation,
  CONTACTS_SAVE_ERROR,
  CONTACTS_SAVE_SUCCESS,
  type SocialNetworkFormItem
} from '~/constants/contacts';
import { safeMutate } from '~/lib/utils/safeMutate';
import {
  SocialNetworkTypes,
  type UpdateContactsInput as GraphQLUpdateContactsInput,
  type UpdateContactsMutation,
  type UpdateContactsMutationVariables,
  useUpdateContactsMutation
} from '~/types/graphql/generated/graphql';

export type ContactsUpdateInput = {
  contactInformation: ContactInformation;
  socialNetworks: SocialNetworkFormItem[];
};

export const mapContactsInput = ({
  contactInformation: { foundationName, address, phone, email },
  socialNetworks
}: ContactsUpdateInput): GraphQLUpdateContactsInput => ({
  contactInformation: {
    foundationName: { uk: foundationName.uk, en: foundationName.en },
    address: { uk: address.uk, en: address.en },
    phone,
    email
  },
  socialNetworks: socialNetworks.map(({ platform, link }) => ({
    icon: platform as SocialNetworkTypes,
    link
  }))
});

export const useUpsertContacts = () => {
  const [mutate, { loading, error }] = useUpdateContactsMutation();

  const updateContacts = async (input: ContactsUpdateInput) => {
    try {
      const result = await safeMutate<UpdateContactsMutation, UpdateContactsMutationVariables>(
        mutate,
        { input: mapContactsInput(input) },
        CONTACTS_SAVE_ERROR,
        CONTACTS_SAVE_ERROR
      );

      if (result.errors?.length) {
        throw new Error(result.errors[0].message);
      }

      toast.success(CONTACTS_SAVE_SUCCESS);
      return result;
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : CONTACTS_SAVE_ERROR);
      return null;
    }
  };

  return { updateContacts, loading, error };
};
