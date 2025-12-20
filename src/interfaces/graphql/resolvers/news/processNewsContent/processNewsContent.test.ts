jest.mock('../../extractImageSrc/extractImageSrc');
jest.mock('../../removeTmpFlags/removeTmpFlags');
jest.mock('../../uploadService/upload', () => ({
  blobStorageService: jest.fn()
}));

import { extractImageSrcs } from '../../../../../application/use-cases/extractImageSrc/extractImageSrc';
import { removeTmpFlagsRecursively } from '../../../../../application/use-cases/removeTmpFlags/removeTmpFlags';
import { blobStorageService } from '../../../../../application/use-cases/uploadService/upload';
import { NewsContentInput, processNewsContent } from './processNewsContent';

const mockExtractImageSrcs = extractImageSrcs as jest.MockedFunction<typeof extractImageSrcs>;
const mockRemoveTmpFlagsRecursively = removeTmpFlagsRecursively as jest.MockedFunction<
  typeof removeTmpFlagsRecursively
>;
const mockBlobStorageService = blobStorageService as jest.MockedFunction<typeof blobStorageService>;

describe('processNewsContent', () => {
  const mockUploadService = {
    copyBlobsToNewFolder: jest.fn(),
    constructBlobUrl: jest.fn(),
    deleteFile: jest.fn(),
    uploadFile: jest.fn(),
    streamBlob: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockBlobStorageService.mockReturnValue(mockUploadService);
    mockRemoveTmpFlagsRecursively.mockImplementation((data: any) => data);
    console.error = jest.fn();
  });

  describe('when there are no images to process', () => {
    it('should return input unchanged when no images are found', async () => {
      const input: NewsContentInput = {
        content: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs.mockReturnValue([]);

      const result = await processNewsContent(input);

      expect(result).toBe(input);
      expect(mockBlobStorageService).not.toHaveBeenCalled();
      expect(mockUploadService.copyBlobsToNewFolder).not.toHaveBeenCalled();
    });

    it('should return input unchanged when extractImageSrcs returns empty arrays', async () => {
      const input: NewsContentInput = {
        content: {
          uk: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] },
          en: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] }] }
        },
        description: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs.mockReturnValue([]);

      const result = await processNewsContent(input);

      expect(result).toBe(input);
      expect(mockExtractImageSrcs).toHaveBeenCalledTimes(4);
    });
  });

  describe('when processing images with various protocols', () => {
    it('should skip images with http:// protocol', async () => {
      const httpUrl = 'http://example.com/image.jpg';
      const input: NewsContentInput = {
        content: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs.mockReturnValueOnce([httpUrl]).mockReturnValue([]);

      const result = await processNewsContent(input);

      expect(result).toBe(input);
      expect(mockUploadService.copyBlobsToNewFolder).not.toHaveBeenCalled();
    });

    it('should skip images with https:// protocol', async () => {
      const httpsUrl = 'https://example.com/image.jpg';
      const input: NewsContentInput = {
        content: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs.mockReturnValueOnce([httpsUrl]).mockReturnValue([]);

      const result = await processNewsContent(input);

      expect(result).toBe(input);
      expect(mockUploadService.copyBlobsToNewFolder).not.toHaveBeenCalled();
    });

    it('should skip images with data: protocol (base64)', async () => {
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
      const input: NewsContentInput = {
        content: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs.mockReturnValueOnce([dataUrl]).mockReturnValue([]);

      const result = await processNewsContent(input);

      expect(result).toBe(input);
      expect(mockUploadService.copyBlobsToNewFolder).not.toHaveBeenCalled();
    });

    it('should skip empty or whitespace-only image sources', async () => {
      const input: NewsContentInput = {
        content: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs.mockReturnValueOnce(['']).mockReturnValueOnce(['   ']).mockReturnValue([]);

      const result = await processNewsContent(input);

      expect(result).toBe(input);
      expect(mockUploadService.copyBlobsToNewFolder).not.toHaveBeenCalled();
    });
  });

  describe('when processing local image sources', () => {
    it('should process local image source and replace it with new URL', async () => {
      const localSrc = 'temp-image-123.jpg';
      const newUrl = 'https://storage.azure.com/photos/hashed-image-123.jpg';
      const input: NewsContentInput = {
        content: {
          uk: { type: 'doc', content: [{ type: 'image', attrs: { src: localSrc, isTmp: true } }] },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs.mockReturnValueOnce([localSrc]).mockReturnValue([]);
      mockUploadService.copyBlobsToNewFolder.mockResolvedValue(['hashed-image-123.jpg']);
      mockUploadService.constructBlobUrl.mockReturnValue(newUrl);
      mockUploadService.deleteFile.mockResolvedValue(undefined);
      mockRemoveTmpFlagsRecursively.mockImplementation((data: any) => {
        const cleaned = structuredClone(data);
        if (cleaned.content?.uk?.content?.[0]?.attrs) {
          cleaned.content.uk.content[0].attrs.isTmp = false;
        }
        return cleaned;
      });

      const result = await processNewsContent(input);

      expect(mockUploadService.copyBlobsToNewFolder).toHaveBeenCalledWith('tmp', 'photos', [localSrc]);
      expect(mockUploadService.constructBlobUrl).toHaveBeenCalledWith('photos', localSrc);
      expect(mockUploadService.deleteFile).toHaveBeenCalledWith('tmp', localSrc);
      expect(result.content.uk).toHaveProperty(['content', 0, 'attrs', 'src'], newUrl);
      expect(mockRemoveTmpFlagsRecursively).toHaveBeenCalled();
    });

    it('should process multiple images from different language versions', async () => {
      const localSrc1 = 'temp-image-1.jpg';
      const localSrc2 = 'temp-image-2.jpg';
      const newUrl1 = 'https://storage.azure.com/photos/hashed-1.jpg';
      const newUrl2 = 'https://storage.azure.com/photos/hashed-2.jpg';

      const input: NewsContentInput = {
        content: {
          uk: { type: 'doc', content: [{ type: 'image', attrs: { src: localSrc1, isTmp: true } }] },
          en: { type: 'doc', content: [{ type: 'image', attrs: { src: localSrc2, isTmp: true } }] }
        }
      };

      mockExtractImageSrcs.mockReturnValueOnce([localSrc1]).mockReturnValueOnce([localSrc2]).mockReturnValue([]);
      mockUploadService.copyBlobsToNewFolder.mockResolvedValue(['hashed.jpg']);
      mockUploadService.constructBlobUrl.mockReturnValueOnce(newUrl1).mockReturnValueOnce(newUrl2);
      mockUploadService.deleteFile.mockResolvedValue(undefined);

      const result = await processNewsContent(input);

      expect(mockUploadService.copyBlobsToNewFolder).toHaveBeenCalledTimes(2);
      expect(mockUploadService.constructBlobUrl).toHaveBeenCalledTimes(2);
      expect(mockUploadService.deleteFile).toHaveBeenCalledTimes(2);
      expect(result.content.uk).toHaveProperty(['content', 0, 'attrs', 'src'], newUrl1);
      expect(result.content.en).toHaveProperty(['content', 0, 'attrs', 'src'], newUrl2);
    });

    it('should process images in description fields', async () => {
      const localSrc = 'temp-desc-image.jpg';
      const newUrl = 'https://storage.azure.com/photos/hashed-desc.jpg';

      const input: NewsContentInput = {
        content: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        },
        description: {
          uk: { type: 'doc', content: [{ type: 'image', attrs: { src: localSrc, isTmp: true } }] },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([localSrc])
        .mockReturnValueOnce([]);
      mockUploadService.copyBlobsToNewFolder.mockResolvedValue(['hashed.jpg']);
      mockUploadService.constructBlobUrl.mockReturnValue(newUrl);
      mockUploadService.deleteFile.mockResolvedValue(undefined);

      const result = await processNewsContent(input);

      expect(result.description?.uk).toHaveProperty(['content', 0, 'attrs', 'src'], newUrl);
    });

    it('should process coverImage when isTmp is true', async () => {
      const localSrc = 'temp-cover.jpg';
      const newUrl = 'https://storage.azure.com/photos/hashed-cover.jpg';

      const input: NewsContentInput = {
        content: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        },
        coverImage: {
          src: localSrc,
          alt: { uk: 'Cover Alt UK', en: 'Cover Alt EN' },
          isTmp: true
        }
      };

      mockExtractImageSrcs.mockReturnValue([]);
      mockUploadService.copyBlobsToNewFolder.mockResolvedValue(['hashed.jpg']);
      mockUploadService.constructBlobUrl.mockReturnValue(newUrl);
      mockUploadService.deleteFile.mockResolvedValue(undefined);
      mockRemoveTmpFlagsRecursively.mockImplementation((data: any) => {
        const cleaned = structuredClone(data);
        if (cleaned.coverImage) {
          cleaned.coverImage.isTmp = false;
        }
        return cleaned;
      });

      const result = await processNewsContent(input);

      expect(result.coverImage?.src).toBe(newUrl);
      expect(mockRemoveTmpFlagsRecursively).toHaveBeenCalled();
    });

    it('should not process coverImage when isTmp is false', async () => {
      const existingSrc = 'https://storage.azure.com/photos/existing.jpg';

      const input: NewsContentInput = {
        content: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        },
        coverImage: {
          src: existingSrc,
          alt: { uk: 'Cover Alt UK', en: 'Cover Alt EN' },
          isTmp: false
        }
      };

      mockExtractImageSrcs.mockReturnValue([]);

      const result = await processNewsContent(input);

      expect(result.coverImage?.src).toBe(existingSrc);
      expect(mockUploadService.copyBlobsToNewFolder).not.toHaveBeenCalled();
    });

    it('should not process coverImage when isTmp is undefined', async () => {
      const existingSrc = 'https://storage.azure.com/photos/existing.jpg';

      const input: NewsContentInput = {
        content: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        },
        coverImage: {
          src: existingSrc,
          alt: { uk: 'Cover Alt UK', en: 'Cover Alt EN' }
        }
      };

      mockExtractImageSrcs.mockReturnValue([]);

      const result = await processNewsContent(input);

      expect(result.coverImage?.src).toBe(existingSrc);
      expect(mockUploadService.copyBlobsToNewFolder).not.toHaveBeenCalled();
    });
  });

  describe('when handling nested image structures', () => {
    it('should replace images in deeply nested content structures', async () => {
      const localSrc = 'nested-image.jpg';
      const newUrl = 'https://storage.azure.com/photos/hashed-nested.jpg';

      const input: NewsContentInput = {
        content: {
          uk: {
            type: 'doc',
            content: [
              {
                type: 'section',
                content: [
                  {
                    type: 'div',
                    content: [{ type: 'image', attrs: { src: localSrc, isTmp: true } }]
                  }
                ]
              }
            ]
          },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs.mockReturnValueOnce([localSrc]).mockReturnValue([]);
      mockUploadService.copyBlobsToNewFolder.mockResolvedValue(['hashed.jpg']);
      mockUploadService.constructBlobUrl.mockReturnValue(newUrl);
      mockUploadService.deleteFile.mockResolvedValue(undefined);

      const result = await processNewsContent(input);

      expect(result.content.uk).toHaveProperty(['content', 0, 'content', 0, 'content', 0, 'attrs', 'src'], newUrl);
    });

    it('should replace multiple images in array structures', async () => {
      const localSrc1 = 'image1.jpg';
      const localSrc2 = 'image2.jpg';
      const newUrl1 = 'https://storage.azure.com/photos/hashed-1.jpg';
      const newUrl2 = 'https://storage.azure.com/photos/hashed-2.jpg';

      const input: NewsContentInput = {
        content: {
          uk: {
            type: 'doc',
            content: [
              { type: 'image', attrs: { src: localSrc1, isTmp: true } },
              { type: 'image', attrs: { src: localSrc2, isTmp: true } }
            ]
          },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs.mockReturnValueOnce([localSrc1, localSrc2]).mockReturnValue([]);
      mockUploadService.copyBlobsToNewFolder.mockResolvedValue(['hashed.jpg']);
      mockUploadService.constructBlobUrl.mockReturnValueOnce(newUrl1).mockReturnValueOnce(newUrl2);
      mockUploadService.deleteFile.mockResolvedValue(undefined);

      const result = await processNewsContent(input);

      expect(result.content.uk).toHaveProperty(['content', 0, 'attrs', 'src'], newUrl1);
      expect(result.content.uk).toHaveProperty(['content', 1, 'attrs', 'src'], newUrl2);
    });
  });

  describe('error handling', () => {
    it('should continue processing other images if one upload fails', async () => {
      const localSrc1 = 'image1.jpg';
      const localSrc2 = 'image2.jpg';
      const newUrl2 = 'https://storage.azure.com/photos/hashed-2.jpg';

      const input: NewsContentInput = {
        content: {
          uk: {
            type: 'doc',
            content: [
              { type: 'image', attrs: { src: localSrc1, isTmp: true } },
              { type: 'image', attrs: { src: localSrc2, isTmp: true } }
            ]
          },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs.mockReturnValueOnce([localSrc1, localSrc2]).mockReturnValue([]);
      mockUploadService.copyBlobsToNewFolder
        .mockRejectedValueOnce(new Error('Upload failed'))
        .mockResolvedValueOnce(['hashed.jpg']);
      mockUploadService.constructBlobUrl.mockReturnValue(newUrl2);
      mockUploadService.deleteFile.mockResolvedValue(undefined);

      const result = await processNewsContent(input);

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to process image'), expect.any(Error));
      expect(result.content.uk).toHaveProperty(['content', 0, 'attrs', 'src'], localSrc1);
      expect(result.content.uk).toHaveProperty(['content', 1, 'attrs', 'src'], newUrl2);
    });

    it('should log error but continue if delete fails', async () => {
      const localSrc = 'temp-image.jpg';
      const newUrl = 'https://storage.azure.com/photos/hashed.jpg';

      const input: NewsContentInput = {
        content: {
          uk: { type: 'doc', content: [{ type: 'image', attrs: { src: localSrc, isTmp: true } }] },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs.mockReturnValueOnce([localSrc]).mockReturnValue([]);
      mockUploadService.copyBlobsToNewFolder.mockResolvedValue(['hashed.jpg']);
      mockUploadService.constructBlobUrl.mockReturnValue(newUrl);
      mockUploadService.deleteFile.mockRejectedValue(new Error('Delete failed'));

      const result = await processNewsContent(input);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to delete tmp blob'),
        expect.any(Error)
      );
      expect(result.content.uk).toHaveProperty(['content', 0, 'attrs', 'src'], newUrl);
    });

    it('should return original input if all uploads fail', async () => {
      const localSrc = 'temp-image.jpg';

      const input: NewsContentInput = {
        content: {
          uk: { type: 'doc', content: [{ type: 'image', attrs: { src: localSrc, isTmp: true } }] },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs.mockReturnValueOnce([localSrc]).mockReturnValue([]);
      mockUploadService.copyBlobsToNewFolder.mockRejectedValue(new Error('Upload failed'));

      const result = await processNewsContent(input);

      expect(console.error).toHaveBeenCalled();
      expect(result.content.uk).toHaveProperty(['content', 0, 'attrs', 'src'], localSrc);
    });
  });

  describe('removeTmpFlags integration', () => {
    it('should call removeTmpFlagsRecursively after processing images', async () => {
      const localSrc = 'temp-image.jpg';
      const newUrl = 'https://storage.azure.com/photos/hashed.jpg';

      const input: NewsContentInput = {
        content: {
          uk: { type: 'doc', content: [{ type: 'image', attrs: { src: localSrc, isTmp: true } }] },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs.mockReturnValueOnce([localSrc]).mockReturnValue([]);
      mockUploadService.copyBlobsToNewFolder.mockResolvedValue(['hashed.jpg']);
      mockUploadService.constructBlobUrl.mockReturnValue(newUrl);
      mockUploadService.deleteFile.mockResolvedValue(undefined);

      await processNewsContent(input);

      expect(mockRemoveTmpFlagsRecursively).toHaveBeenCalledTimes(1);
      expect(mockRemoveTmpFlagsRecursively).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.any(Object)
        })
      );
    });

    it('should not call removeTmpFlagsRecursively when no images are processed', async () => {
      const input: NewsContentInput = {
        content: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs.mockReturnValue([]);

      await processNewsContent(input);

      expect(mockRemoveTmpFlagsRecursively).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle input with only coverImage', async () => {
      const localSrc = 'cover.jpg';
      const newUrl = 'https://storage.azure.com/photos/hashed-cover.jpg';

      const input: NewsContentInput = {
        content: {
          uk: null,
          en: null
        },
        coverImage: {
          src: localSrc,
          isTmp: true
        }
      };

      mockExtractImageSrcs.mockReturnValue([]);
      mockUploadService.copyBlobsToNewFolder.mockResolvedValue(['hashed.jpg']);
      mockUploadService.constructBlobUrl.mockReturnValue(newUrl);
      mockUploadService.deleteFile.mockResolvedValue(undefined);

      const result = await processNewsContent(input);

      expect(result.coverImage?.src).toBe(newUrl);
    });

    it('should handle duplicate image sources', async () => {
      const localSrc = 'duplicate.jpg';
      const newUrl = 'https://storage.azure.com/photos/hashed-dup.jpg';

      const input: NewsContentInput = {
        content: {
          uk: {
            type: 'doc',
            content: [
              { type: 'image', attrs: { src: localSrc, isTmp: true } },
              { type: 'image', attrs: { src: localSrc, isTmp: true } }
            ]
          },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs.mockReturnValueOnce([localSrc, localSrc]).mockReturnValue([]);
      mockUploadService.copyBlobsToNewFolder.mockResolvedValue(['hashed.jpg']);
      mockUploadService.constructBlobUrl.mockReturnValue(newUrl);
      mockUploadService.deleteFile.mockResolvedValue(undefined);

      const result = await processNewsContent(input);

      // Should copy only once per unique source
      expect(mockUploadService.copyBlobsToNewFolder).toHaveBeenCalledTimes(1);
      // Both instances should be replaced
      expect(result.content.uk).toHaveProperty(['content', 0, 'attrs', 'src'], newUrl);
      expect(result.content.uk).toHaveProperty(['content', 1, 'attrs', 'src'], newUrl);
    });

    it('should preserve other properties when replacing src', async () => {
      const localSrc = 'image.jpg';
      const newUrl = 'https://storage.azure.com/photos/hashed.jpg';

      const input: NewsContentInput = {
        content: {
          uk: {
            type: 'doc',
            content: [
              {
                type: 'image',
                attrs: {
                  src: localSrc,
                  alt: 'Alt text',
                  title: 'Image title',
                  width: 800,
                  height: 600,
                  isTmp: true
                }
              }
            ]
          },
          en: { type: 'doc', content: [] }
        }
      };

      mockExtractImageSrcs.mockReturnValueOnce([localSrc]).mockReturnValue([]);
      mockUploadService.copyBlobsToNewFolder.mockResolvedValue(['hashed.jpg']);
      mockUploadService.constructBlobUrl.mockReturnValue(newUrl);
      mockUploadService.deleteFile.mockResolvedValue(undefined);

      const result = await processNewsContent(input);

      const imageAttrs = (result.content.uk as any).content[0].attrs;
      expect(imageAttrs.src).toBe(newUrl);
      expect(imageAttrs.alt).toBe('Alt text');
      expect(imageAttrs.title).toBe('Image title');
      expect(imageAttrs.width).toBe(800);
      expect(imageAttrs.height).toBe(600);
    });
  });
});
