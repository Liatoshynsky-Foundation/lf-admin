import { CONTACTS_MOCK } from '../../../(logged_in)/contacts/(temp)/contacts.mock';
import { normalizeContactsData, useContacts } from './useContacts';
import { INITIAL_CONTACT_INFORMATION } from '~/constants/contacts';

describe('useContacts', () => {
  it('returns the contacts fixture and idle state', () => {
    expect(useContacts()).toEqual({ data: CONTACTS_MOCK, loading: false, error: undefined });
  });

  it('uses initial contact information when it is missing', () => {
    const result = normalizeContactsData({
      contactInformation: null,
      socialNetworks: null
    });

    expect(result).toEqual({
      contactInformation: INITIAL_CONTACT_INFORMATION,
      socialNetworks: []
    });
  });
});
