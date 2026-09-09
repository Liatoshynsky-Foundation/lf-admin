import toast from 'react-hot-toast';
import type { z } from 'zod';

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
import { zContactsSchema } from '~/validators/contacts.schema';

type ContactsUpdateInput = {
  contactInformation: ContactInformation;
  socialNetworks: SocialNetworkFormItem[];
};

export type ContactsFormErrors = {
  contactInformation: Record<string, string>;
  socialNetworks: Record<string, string>;
};

type ValidatedContactsInput = z.output<typeof zContactsSchema>;

const mapContactsInput = ({ contactInformation, socialNetworks }: ContactsUpdateInput) => ({
  contactInformation,
  socialNetworks: socialNetworks.map(({ platform, link }) => ({ icon: platform, link }))
});

const mapMutationInput = ({ contactInformation, socialNetworks }: ValidatedContactsInput): GraphQLUpdateContactsInput => ({
  contactInformation,
  socialNetworks: socialNetworks.map(({ icon, link }) => ({ icon: icon as SocialNetworkTypes, link }))
});

const getValidationErrors = (error: z.ZodError): ContactsFormErrors => {
  const errors: ContactsFormErrors = { contactInformation: {}, socialNetworks: {} };

  error.issues.forEach((issue) => {
    const [section, ...path] = issue.path;

    if (section === 'contactInformation' || section === 'socialNetworks') {
      errors[section][path.join('.')] = issue.message;
    }
  });

  return errors;
};

export const useUpsertContacts = () => {
  const [mutate, { loading, error }] = useUpdateContactsMutation();

  const updateContacts = async (input: ContactsUpdateInput): Promise<ContactsFormErrors | null> => {
    const validation = zContactsSchema.safeParse(mapContactsInput(input));
    if (!validation.success) return getValidationErrors(validation.error);

    try {
      const result = await safeMutate<UpdateContactsMutation, UpdateContactsMutationVariables>(
        mutate,
        { input: mapMutationInput(validation.data) },
        CONTACTS_SAVE_ERROR,
        CONTACTS_SAVE_ERROR
      );

      if (result.errors?.length) {
        throw new Error(result.errors[0].message);
      }

      toast.success(CONTACTS_SAVE_SUCCESS);
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : CONTACTS_SAVE_ERROR);
    }

    return null;
  };

  return { updateContacts, loading, error };
};
