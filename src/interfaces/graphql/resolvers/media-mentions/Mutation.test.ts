import { GraphQLError } from 'graphql';

import { MediaMentionsMutation } from './Mutation';

const parser = jest.fn();
const slugGenerator = jest.fn();

jest.mock('~/lib/parser/mediaMentionsParser', () => ({
  __esModule: true,
  default: (...args: unknown[]) => parser(...args)
}));
jest.mock('~/src/shared/utils/slugGenerator/slugGenerator', () => ({
  generateUniqueSlug: (...args: unknown[]) => slugGenerator(...args)
}));

describe('media-mentions Mutation', () => {
  it('should throw when not admin', async () => {
    await expect(
      MediaMentionsMutation.createMediaMention({}, { input: { url: 'x' } }, { admin: false } as any)
    ).rejects.toThrow(GraphQLError);
  });

  it('should throw when url missing', async () => {
    await expect(
      MediaMentionsMutation.createMediaMention({}, { input: { url: '' } }, {
        admin: true,
        requestContainer: { cradle: {} }
      } as any)
    ).rejects.toThrow(GraphQLError);
  });

  it('should create media mention when parse and slug generation succeed', async () => {
    const fakeEntity = {
      title: 'T',
      description: 'D',
      coverImage: { src: 's', alt: '', width: null, height: null },
      publishedAt: new Date()
    } as any;
    parser.mockResolvedValue(fakeEntity);
    slugGenerator.mockResolvedValue('slug-1');

    const repo = {
      findBySlug: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ ok: true, value: { id: '1' } })
    };
    const ctx = { admin: true, requestContainer: { cradle: { mediaMentionsRepository: repo } } } as any;

    const res = await MediaMentionsMutation.createMediaMention({}, { input: { url: 'https://x' } }, ctx);

    expect(parser).toHaveBeenCalledWith('https://x');
    expect(slugGenerator).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalled();
    expect(res).toEqual({ id: '1' });
  });
});
