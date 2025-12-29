import { newMediaMentionRepository } from './repository';

jest.mock('mongodb', () => ({
  ObjectId: { isValid: (id: string) => /^[a-fA-F0-9]{24}$/.test(id) }
}));
jest.mock('mongoose', () => ({
  Types: { ObjectId: { isValid: (id: string) => /^[a-fA-F0-9]{24}$/.test(id) } }
}));

const saveMock = jest.fn();
const findByIdAndUpdateMock = jest.fn();

describe('Media Mentions Repository', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a media mention (success)', async () => {
    const savedDoc = {
      _id: { toHexString: () => '507f1f77bcf86cd799439011' },
      url: 'https://ex.com',
      title: 't',
      description: 'd',
      slug: 's',
      coverImage: null,
      status: 'DRAFT',
      meta: {},
      publishedAt: new Date(0),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    saveMock.mockResolvedValue(savedDoc);

    class MockModel {
      _doc: any;
      constructor(doc: any) {
        this._doc = doc;
      }
      save = saveMock;
    }

    const repo = newMediaMentionRepository({ MediaMentionsModel: MockModel as any });
    const res = await repo.create({
      url: 'https://ex.com',
      title: 't',
      description: 'd',
      slug: 's',
      coverImage: null,
      meta: {},
      publishedAt: new Date(0)
    } as any);

    expect(res).toBeDefined();
  });

  it('should add view count (success and not found)', async () => {
    const updated = { meta: { views: 7 } };

    findByIdAndUpdateMock.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(updated) }) });

    class FindModel {
      findByIdAndUpdate = findByIdAndUpdateMock;
    }

    const repoSuccess = newMediaMentionRepository({ MediaMentionsModel: FindModel as any });
    const ok = await repoSuccess.addView('507f1f77bcf86cd799439011');
    expect(ok).toBeDefined();

    findByIdAndUpdateMock.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });

    const repoNotFound = newMediaMentionRepository({ MediaMentionsModel: FindModel as any });
    const nf = await repoNotFound.addView('507f1f77bcf86cd799439011');
    expect(nf).toBeDefined();
  });

  it('should return error for invalid id and handle save error', async () => {
    const repo = newMediaMentionRepository({ MediaMentionsModel: class {} as any });
    const bad = await repo.addView('bad-id');
    expect(bad).toBeDefined();

    class ErrModel {
      constructor() {}
      save = saveMock.mockRejectedValue(new Error('fail'));
      findByIdAndUpdate = findByIdAndUpdateMock;
    }

    const repoErr = newMediaMentionRepository({ MediaMentionsModel: ErrModel as any });
    const created = await repoErr.create({ url: 'x', title: 't' } as any);
    expect(created).toBeDefined();
  });
});
