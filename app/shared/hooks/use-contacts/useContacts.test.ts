import { renderHook } from '@testing-library/react';

import { CONTACTS_DATA } from '../../../(logged_in)/contacts/__mocks__/contacts';
import { normalizeContactsData, useContacts } from './useContacts';
import type { GetContactsQuery } from '~/types/graphql/generated/graphql';

const useGetContactsQuery = jest.fn();
const CONTACTS_QUERY_ERROR = new Error('Request failed');

const CONTACTS_QUERY_RESPONSE = {
  contactInformation: CONTACTS_DATA.contactInformation,
  socialNetworks: CONTACTS_DATA.socialNetworks.map(({ platform, link }) => ({ icon: platform, link }))
} as GetContactsQuery['contacts'];

jest.mock('~/types/graphql/generated/graphql', () => ({
  useGetContactsQuery: () => useGetContactsQuery()
}));

describe('useContacts', () => {
  it('maps the contacts query response to the form data shape', () => {
    expect(normalizeContactsData(CONTACTS_QUERY_RESPONSE)).toEqual(CONTACTS_DATA);
  });

  it('returns null when the query has no contacts', () => {
    expect(normalizeContactsData(null)).toBeNull();
  });

  it('returns mapped query data with its Apollo state', () => {
    useGetContactsQuery.mockReturnValue({
      data: { contacts: CONTACTS_QUERY_RESPONSE },
      loading: true,
      error: CONTACTS_QUERY_ERROR
    });

    const { result } = renderHook(() => useContacts());

    expect(result.current).toEqual({ data: CONTACTS_DATA, loading: true, error: CONTACTS_QUERY_ERROR });
  });
});
