import { renderHook } from '@testing-library/react';

import { CONTACT_INFORMATION, SOCIAL_NETWORKS } from '../../../(logged_in)/contacts/__mocks__/contacts';
import { useUpsertContacts } from './useUpsertContacts';

describe('useUpsertContacts', () => {
  it('logs a payload without form-only ids', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const { result } = renderHook(() => useUpsertContacts());
    result.current.updateContacts({ contactInformation: CONTACT_INFORMATION, socialNetworks: SOCIAL_NETWORKS });

    expect(consoleSpy).toHaveBeenCalledWith({
      ...CONTACT_INFORMATION,
      socialNetworks: SOCIAL_NETWORKS.map(({ id: _id, ...item }) => item)
    });
    consoleSpy.mockRestore();
  });
});
