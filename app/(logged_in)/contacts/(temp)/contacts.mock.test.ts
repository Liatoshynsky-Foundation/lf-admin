import { CONTACTS_MOCK } from './contacts.mock';

describe('CONTACTS_MOCK', () => {
  it('contains contact information and social networks', () => {
    expect(CONTACTS_MOCK.contactInformation).toEqual(
      expect.objectContaining({
        name: expect.objectContaining({ uk: expect.any(String), en: expect.any(String) }),
        location: expect.objectContaining({ uk: expect.any(String), en: expect.any(String) }),
        phone: expect.any(String),
        email: expect.any(String)
      })
    );

    expect(CONTACTS_MOCK.socialNetworks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ platform: expect.any(String), link: expect.any(String) })
      ])
    );
  });
});
