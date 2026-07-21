jest.mock('~/src/application/use-cases/extractImageSrc/extractImageSrc');
jest.mock('~/src/application/use-cases/removeTmpFlags/removeTmpFlags');

import { NewsContentInput, processNewsContent } from './processNewsContent';
import { extractImageSrcs } from '~/src/application/use-cases/extractImageSrc/extractImageSrc';
import { removeTmpFlagsRecursively } from '~/src/application/use-cases/removeTmpFlags/removeTmpFlags';

const mockExtractImageSrcs = extractImageSrcs as jest.MockedFunction<typeof extractImageSrcs>;
const mockRemoveTmpFlagsRecursively = removeTmpFlagsRecursively as jest.MockedFunction<
  typeof removeTmpFlagsRecursively
>;

describe('processNewsContent', () => {
  const baseContent = {
    uk: { type: 'doc', content: [] },
    en: { type: 'doc', content: [] }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRemoveTmpFlagsRecursively.mockImplementation((data) => data);
  });

  it('returns input unchanged when no image sources are found', async () => {
    const input: NewsContentInput = {
      content: baseContent
    };

    mockExtractImageSrcs.mockReturnValue([]);

    const result = await processNewsContent(input);

    expect(result).toBe(input);
    expect(mockExtractImageSrcs).toHaveBeenCalledTimes(2);
    expect(mockRemoveTmpFlagsRecursively).not.toHaveBeenCalled();
  });

  it('checks content and description locales for image sources', async () => {
    const input: NewsContentInput = {
      content: baseContent,
      description: {
        uk: { type: 'doc', content: [] },
        en: { type: 'doc', content: [] }
      }
    };

    mockExtractImageSrcs.mockReturnValue([]);

    await processNewsContent(input);

    expect(mockExtractImageSrcs).toHaveBeenCalledTimes(4);
    expect(mockExtractImageSrcs).toHaveBeenNthCalledWith(1, input.content.uk);
    expect(mockExtractImageSrcs).toHaveBeenNthCalledWith(2, input.content.en);
    expect(mockExtractImageSrcs).toHaveBeenNthCalledWith(3, input.description?.uk);
    expect(mockExtractImageSrcs).toHaveBeenNthCalledWith(4, input.description?.en);
  });

  it('collects image sources from every localized content field', async () => {
    const input: NewsContentInput = {
      content: baseContent,
      description: {
        uk: { type: 'doc', content: [] },
        en: { type: 'doc', content: [] }
      }
    };

    mockExtractImageSrcs
      .mockReturnValueOnce(['content-uk.jpg'])
      .mockReturnValueOnce(['content-en.jpg'])
      .mockReturnValueOnce(['description-uk.jpg'])
      .mockReturnValueOnce(['description-en.jpg']);

    await processNewsContent(input);

    expect(mockRemoveTmpFlagsRecursively).toHaveBeenCalledWith(input);
  });

  it('removes tmp flags when content contains an image source without changing the image URL', async () => {
    const imageSrc = 'https://pub-xxx.r2.dev/photos/news-image.jpg';
    const input: NewsContentInput = {
      content: {
        uk: { type: 'doc', content: [{ type: 'image', attrs: { src: imageSrc, isTmp: true } }] },
        en: { type: 'doc', content: [] }
      }
    };
    const cleaned = {
      content: {
        uk: { type: 'doc', content: [{ type: 'image', attrs: { src: imageSrc, isTmp: false } }] },
        en: { type: 'doc', content: [] }
      }
    } as NewsContentInput;

    mockExtractImageSrcs.mockReturnValueOnce([imageSrc]).mockReturnValue([]);
    mockRemoveTmpFlagsRecursively.mockReturnValue(cleaned);

    const result = await processNewsContent(input);

    expect(mockRemoveTmpFlagsRecursively).toHaveBeenCalledWith(input);
    expect(result).toBe(cleaned);
    expect((result.content.uk as any).content[0].attrs.src).toBe(imageSrc);
  });

  it('deduplicates image sources before deciding to clean tmp flags', async () => {
    const imageSrc = 'duplicate.jpg';
    const input: NewsContentInput = {
      content: {
        uk: {
          type: 'doc',
          content: [
            { type: 'image', attrs: { src: imageSrc, isTmp: true } },
            { type: 'image', attrs: { src: imageSrc, isTmp: true } }
          ]
        },
        en: { type: 'doc', content: [] }
      }
    };

    mockExtractImageSrcs.mockReturnValueOnce([imageSrc, imageSrc]).mockReturnValue([]);

    await processNewsContent(input);

    expect(mockRemoveTmpFlagsRecursively).toHaveBeenCalledTimes(1);
    expect(mockRemoveTmpFlagsRecursively).toHaveBeenCalledWith(input);
  });

  it('uses a tmp cover image as a signal to clean tmp flags', async () => {
    const coverSrc = 'https://pub-xxx.r2.dev/photos/cover.jpg';
    const input: NewsContentInput = {
      content: baseContent,
      coverImage: {
        src: coverSrc,
        alt: { uk: 'Обкладинка', en: 'Cover' },
        isTmp: true
      }
    };
    const cleaned: NewsContentInput = {
      ...input,
      coverImage: {
        ...input.coverImage!,
        isTmp: false
      }
    };

    mockExtractImageSrcs.mockReturnValue([]);
    mockRemoveTmpFlagsRecursively.mockReturnValue(cleaned);

    const result = await processNewsContent(input);

    expect(mockRemoveTmpFlagsRecursively).toHaveBeenCalledWith(input);
    expect(result.coverImage?.src).toBe(coverSrc);
    expect(result.coverImage?.isTmp).toBe(false);
  });

  it('does not clean when cover image is already persisted and content has no images', async () => {
    const input: NewsContentInput = {
      content: baseContent,
      coverImage: {
        src: 'https://pub-xxx.r2.dev/photos/cover.jpg',
        isTmp: false
      }
    };

    mockExtractImageSrcs.mockReturnValue([]);

    const result = await processNewsContent(input);

    expect(result).toBe(input);
    expect(mockRemoveTmpFlagsRecursively).not.toHaveBeenCalled();
  });

  it('handles nullable localized content without trying to extract image sources', async () => {
    const input = {
      content: {
        uk: null,
        en: null
      },
      coverImage: {
        src: 'cover.jpg',
        isTmp: true
      }
    } as unknown as NewsContentInput;

    mockExtractImageSrcs.mockReturnValue([]);

    await processNewsContent(input);

    expect(mockExtractImageSrcs).not.toHaveBeenCalled();
    expect(mockRemoveTmpFlagsRecursively).toHaveBeenCalledWith(input);
  });
});
