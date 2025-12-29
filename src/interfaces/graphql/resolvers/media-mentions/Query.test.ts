import { MediaMentionsQuery } from './Query';

describe('media-mentions Query', () => {
  it('should throw when not admin', async () => {
    const ctx = { admin: false } as any;
    await expect(MediaMentionsQuery.allMediaMentions({}, { filters: {} } as any, ctx)).rejects.toThrow();
  });

  it('should map filters and call repo.findAll', async () => {
    const repo = { findAll: jest.fn().mockResolvedValue(['r']) };
    const ctx = { admin: true, requestContainer: { cradle: { mediaMentionsRepository: repo } } } as any;
    const res = await MediaMentionsQuery.allMediaMentions({}, { filters: { status: 'PUBLISHED' } } as any, ctx);
    expect(res).toEqual(['r']);
    expect(repo.findAll).toHaveBeenCalledWith({ status: 'PUBLISHED' });
  });
});
