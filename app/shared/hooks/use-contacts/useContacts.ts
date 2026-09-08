import { CONTACTS_MOCK } from '../../../(logged_in)/contacts/(temp)/contacts.mock';
import {
  type ContactInformation,
  type ContactsData,
  INITIAL_CONTACT_INFORMATION,
  type SocialNetworkInput
} from '~/constants/contacts';

type ContactsDataResponse = {
  contactInformation?: ContactInformation | null;
  socialNetworks?: SocialNetworkInput[] | null;
};

export const normalizeContactsData = (data: ContactsDataResponse): ContactsData => ({
  contactInformation: data.contactInformation ?? INITIAL_CONTACT_INFORMATION,
  socialNetworks: data.socialNetworks ?? []
});

const NORMALIZED_CONTACTS_DATA = normalizeContactsData(CONTACTS_MOCK);

export const useContacts = (): { data: ContactsData | null; loading: boolean; error: undefined } => ({
  data: NORMALIZED_CONTACTS_DATA,
  loading: false,
  error: undefined
});
