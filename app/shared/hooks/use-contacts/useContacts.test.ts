import { CONTACTS_MOCK } from '../../../(logged_in)/contacts/(temp)/contacts.mock';
import { useContacts } from './useContacts';

describe('useContacts', () => {
  it('returns the contacts fixture and idle state', () => {
    expect(useContacts()).toEqual({ data: CONTACTS_MOCK, loading: false, error: undefined });
  });
});
