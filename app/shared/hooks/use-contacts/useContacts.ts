import { CONTACTS_MOCK } from '../../../(logged_in)/contacts/(temp)/contacts.mock';
import type { ContactsData } from '~/constants/contacts';

export const useContacts = (): { data: ContactsData | null; loading: boolean; error: undefined } => ({
  data: CONTACTS_MOCK,
  loading: false,
  error: undefined
});
