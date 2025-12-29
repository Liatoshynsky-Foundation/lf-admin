import { GraphQLError } from 'graphql';

import { endpointRepositoryHandler } from './helpers';

describe('endpointRepositoryHandler', () => {
  const fakeRepo = { findById: jest.fn().mockResolvedValue({ id: '1' }) };
  const rc = { cradle: { mediaMentionsRepository: fakeRepo } } as any;

  it('should throw GraphQLError when admin is falsy', async () => {
    const handler = endpointRepositoryHandler('mediaMentionsRepository')(async ({ repo }) => repo.findById('1'));
    await expect(handler({}, {}, { requestContainer: rc, admin: false } as any)).rejects.toThrow(GraphQLError);
  });

  it('should call handler and return value when admin is true', async () => {
    const handler = endpointRepositoryHandler('mediaMentionsRepository')(async ({ args, repo }) =>
      repo.findById((args as any).id)
    );
    const res = await handler({}, { id: '1' } as any, { requestContainer: rc, admin: true } as any);
    expect(res).toEqual({ id: '1' });
    expect(fakeRepo.findById).toHaveBeenCalledWith('1');
  });
});
