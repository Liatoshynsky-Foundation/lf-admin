import { renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';

import { CONTACT_INFORMATION, SOCIAL_NETWORKS } from '../../../(logged_in)/contacts/__mocks__/contacts';
import { mapContactsInput, useUpsertContacts } from './useUpsertContacts';
import { type ContactInformation, CONTACTS_SAVE_ERROR } from '~/constants/contacts';
import { safeMutate } from '~/lib/utils/safeMutate';

const mutate = jest.fn();

const CONTACT_INFORMATION_WITH_TYPENAME: ContactInformation & {
  foundationName: ContactInformation['foundationName'] & { __typename: string };
  address: ContactInformation['address'] & { __typename: string };
} = {
  ...CONTACT_INFORMATION,
  foundationName: { ...CONTACT_INFORMATION.foundationName, __typename: 'LocalizedString' },
  address: { ...CONTACT_INFORMATION.address, __typename: 'LocalizedString' }
};

jest.mock('~/types/graphql/generated/graphql', () => ({
  SocialNetworkTypes: { Facebook: 'facebook', Instagram: 'instagram' },
  useUpdateContactsMutation: () => [mutate, { loading: false, error: undefined }]
}));
jest.mock('~/lib/utils/safeMutate', () => ({ safeMutate: jest.fn() }));
jest.mock('react-hot-toast', () => ({ success: jest.fn(), error: jest.fn() }));


describe('useUpsertContacts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mapContactsInput', () => {
    it('maps form values and removes GraphQL typenames and form-only social-network ids', () => {
      expect(mapContactsInput({ contactInformation: CONTACT_INFORMATION_WITH_TYPENAME, socialNetworks: SOCIAL_NETWORKS })).toEqual({
        contactInformation: CONTACT_INFORMATION,
        socialNetworks: SOCIAL_NETWORKS.map(({ id: _id, platform, link }) => ({ icon: platform, link }))
      });
    });
  });

  it('sends the mapped contacts input through the mutation helper', async () => {
    jest.mocked(safeMutate).mockResolvedValue({ errors: [] });
    const { result } = renderHook(() => useUpsertContacts());

    await result.current.updateContacts({ contactInformation: CONTACT_INFORMATION, socialNetworks: SOCIAL_NETWORKS });

    expect(safeMutate).toHaveBeenCalledWith(
      mutate,
      {
        input: {
          contactInformation: CONTACT_INFORMATION,
          socialNetworks: SOCIAL_NETWORKS.map(({ id: _id, platform, link }) => ({ icon: platform, link }))
        }
      },
      CONTACTS_SAVE_ERROR,
      CONTACTS_SAVE_ERROR
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows the mutation error and returns null when the helper fails', async () => {
    const error = new Error('Update failed');
    jest.mocked(safeMutate).mockRejectedValue(error);
    const { result } = renderHook(() => useUpsertContacts());

    await expect(result.current.updateContacts({ contactInformation: CONTACT_INFORMATION, socialNetworks: SOCIAL_NETWORKS })).resolves.toBeNull();

    expect(toast.error).toHaveBeenCalledWith(error.message);
  });

  it('shows a GraphQL error returned by the mutation result', async () => {
    const errorMessage = 'Invalid contacts';
    jest.mocked(safeMutate).mockResolvedValue({ errors: [{ message: errorMessage }] });
    const { result } = renderHook(() => useUpsertContacts());

    await expect(result.current.updateContacts({ contactInformation: CONTACT_INFORMATION, socialNetworks: SOCIAL_NETWORKS })).resolves.toBeNull();

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('uses the default error message for a non-Error mutation failure', async () => {
    jest.mocked(safeMutate).mockRejectedValue('Update failed');
    const { result } = renderHook(() => useUpsertContacts());

    await result.current.updateContacts({ contactInformation: CONTACT_INFORMATION, socialNetworks: SOCIAL_NETWORKS });

    expect(toast.error).toHaveBeenCalledWith(CONTACTS_SAVE_ERROR);
  });
});
