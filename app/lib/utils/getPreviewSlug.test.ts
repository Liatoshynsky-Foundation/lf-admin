import { getPreviewSlug } from './getPreviewSlug';
import { PublicationsItemType } from '~/constants/publications';

describe('getPreviewSlug', () => {
  it('should return correct path when publicationType is media', () => {
    const result = getPreviewSlug({
      publicationType: 'media' as PublicationsItemType,
      dbSlug: 'some-slug'
    });
    expect(result).toBe('/news?tab=press');
  });

  it('should return correct path when publicationType is not media', () => {
    const result = getPreviewSlug({
      publicationType: 'news' as PublicationsItemType,
      dbSlug: 'some-slug'
    });
    expect(result).toBe('news/some-slug');
  });
});
