import { handleUploadImage } from './uploadToTmpFolder';
import { BLOCK_IDS } from '~/constants/pageBlocks';
import { useStore } from '~/store';

jest.mock('~/store', () => ({
  useStore: {
    getState: jest.fn()
  }
}));

describe('handleUploadImage', () => {
  const setFieldMock = jest.fn();
  const uploadBlobMock = jest.fn();

  const existingImage = {
    src: 'old.png',
    alt: { uk: 'старий alt', en: 'old alt' },
    caption: { uk: 'старий підпис', en: 'old caption' },
    isTmp: false,
    crop: { rect: { x: 10, y: 20, width: 100, height: 200 } }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStore.getState as jest.Mock).mockReturnValue({
      setField: setFieldMock,
      blocks: {
        page1: {
          [BLOCK_IDS.INTRO_SECTION]: {
            image: existingImage
          }
        }
      }
    });
  });

  it('should upload image and preserve existing fields (alt, caption, crop)', async () => {
    const file = {
      name: 'test.png',
      type: 'image/png',
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(4))
    } as unknown as File;

    uploadBlobMock.mockResolvedValue({
      data: {
        uploadBlob: {
          success: true,
          blobName: 'uploaded_test.png'
        }
      }
    });

    const result = await handleUploadImage(file, 'page1', BLOCK_IDS.INTRO_SECTION, 'image', uploadBlobMock, 'tmp');

    expect(file.arrayBuffer).toHaveBeenCalled();
    expect(uploadBlobMock).toHaveBeenCalledWith({
      variables: expect.objectContaining({
        folderName: 'tmp',
        blobName: 'test.png',
        contentType: 'image/png',
        buffer: expect.any(String)
      })
    });

    expect(setFieldMock).toHaveBeenCalledWith(
      'page1',
      BLOCK_IDS.INTRO_SECTION,
      'image',
      expect.objectContaining({
        src: 'uploaded_test.png',
        isTmp: true,
        alt: existingImage.alt,
        caption: existingImage.caption,
        crop: existingImage.crop
      })
    );
    expect(result).toBe('uploaded_test.png');
  });

  it('should not update store if uploadBlob fails', async () => {
    const file = {
      name: 'fail.png',
      type: 'image/png',
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(4))
    } as unknown as File;

    uploadBlobMock.mockResolvedValue({
      data: {
        uploadBlob: {
          success: false,
          blobName: null
        }
      }
    });

    const result = await handleUploadImage(file, 'page1', BLOCK_IDS.INTRO_SECTION, 'image', uploadBlobMock, 'tmp');

    expect(setFieldMock).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('should handle missing existing field gracefully', async () => {
    (useStore.getState as jest.Mock).mockReturnValue({
      setField: setFieldMock,
      blocks: {
        page1: {
          [BLOCK_IDS.INTRO_SECTION]: {}
        }
      }
    });

    const file = {
      name: 'new.png',
      type: 'image/png',
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(4))
    } as unknown as File;

    uploadBlobMock.mockResolvedValue({
      data: {
        uploadBlob: {
          success: true,
          blobName: 'new.png'
        }
      }
    });

    const result = await handleUploadImage(file, 'page1', BLOCK_IDS.INTRO_SECTION, 'image', uploadBlobMock, 'tmp');

    expect(setFieldMock).toHaveBeenCalledWith(
      'page1',
      BLOCK_IDS.INTRO_SECTION,
      'image',
      expect.objectContaining({
        src: 'new.png',
        isTmp: true
      })
    );
    expect(result).toBe('new.png');
  });
});