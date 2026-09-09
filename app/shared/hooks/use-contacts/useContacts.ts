import {
  type ContactsData,
  type SocialNetworkInput
} from '~/constants/contacts';
import {
  type GetContactsQuery,
  useGetContactsQuery
} from '~/types/graphql/generated/graphql';

type ContactsDataResponse = GetContactsQuery['contacts'] | null | undefined;

export const normalizeContactsData = (data: ContactsDataResponse): ContactsData | null => {
  if (!data) return null;

  return {
    contactInformation: data.contactInformation,
    socialNetworks: data.socialNetworks.map<SocialNetworkInput>(({ icon, link }) => ({
      platform: icon,
      link
    }))
  };
};

export const useContacts = () => {
  const { data, loading, error } = useGetContactsQuery();
  const contacts = useMemo(() => normalizeContactsData(data?.contacts), [data]);

  return {
    data: contacts,
    loading,
    error
  };
};
import { useMemo } from 'react';
