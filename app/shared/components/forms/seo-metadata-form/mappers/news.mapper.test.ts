import { mapToUpdateNewsInput } from './news.mapper';
import { mapSeoBase, SeoData } from './seo.mapper';

jest.mock('./seo.mapper', () => ({
  mapSeoBase: jest.fn()
}));

const mockedMapSeoBase = mapSeoBase as jest.MockedFunction<typeof mapSeoBase>;

const buildSeoData = (): SeoData => ({
  meta: {
    uk: { title: 'T', description: 'D', keywords: 'K', canonicalUrl: 'https://a.com' },
    en: { title: 'T', description: 'D', keywords: 'K', canonicalUrl: 'https://a.com/en' }
  },
  allowIndexing: { uk: false, en: true },
  ogImage: null
});

describe('mapToUpdateNewsInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates mapping to mapSeoBase with the provided data', () => {
    const data = buildSeoData();
    const fakeResult = { description: {}, keywords: {}, allowIndexation: {}, coverImage: {} };
    mockedMapSeoBase.mockReturnValue(fakeResult as never);

    mapToUpdateNewsInput(data);

    expect(mockedMapSeoBase).toHaveBeenCalledTimes(1);
    expect(mockedMapSeoBase).toHaveBeenCalledWith(data);
  });

  it('returns exactly the spread output of mapSeoBase', () => {
    const data = buildSeoData();
    const fakeResult = {
      description: { uk: 'D', en: 'D', meta: { description: {}, canonicalUrl: {}, metaTitle: {} } },
      keywords: { uk: 'K', en: 'K' },
      allowIndexation: { uk: false, en: true },
      coverImage: { src: null, alt: { uk: '', en: '' } }
    };
    mockedMapSeoBase.mockReturnValue(fakeResult as never);

    const result = mapToUpdateNewsInput(data);

    expect(result).toEqual(fakeResult);
  });

  it('produces a new object rather than returning the same reference as mapSeoBase', () => {
    const data = buildSeoData();
    const fakeResult = { description: {}, keywords: {}, allowIndexation: {}, coverImage: {} };
    mockedMapSeoBase.mockReturnValue(fakeResult as never);

    const result = mapToUpdateNewsInput(data);

    expect(result).not.toBe(fakeResult);
    expect(result).toEqual(fakeResult);
  });
});
