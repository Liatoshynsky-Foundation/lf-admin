import { CONTACTS_MOCK } from '~/(logged_in)/contacts/contacts.mock';
import type { ContactsData } from '~/constants/contacts';

export const useContacts = (): { data: ContactsData; loading: boolean; error: undefined } => ({
  data: CONTACTS_MOCK,
  loading: false,
  error: undefined
});
