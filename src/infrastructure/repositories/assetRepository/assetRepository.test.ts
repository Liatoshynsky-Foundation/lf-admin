import { createStorageAdapter } from '../../../uploads/storage';
import { createBaseRepository } from '../baseRepository/baseRepository';
import { AssetRepository } from './assetRepository';
import logger from '~/src/middleware/logger/logger';

jest.mock('~/src/middleware/logger/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() }
}));

jest.mock('../baseRepository/baseRepository', () => ({
  createBaseRepository: jest.fn((config) => config)
}));

jest.mock('../../../config', () => ({
  config: { uploads: { storage: { type: 'local' } } }
}));

jest.mock('../../../uploads/storage', () => ({
  createStorageAdapter: jest.fn(() => ({
    delete: jest.fn().mockResolvedValue({ success: true }),
    exists: jest.fn().mockResolvedValue(false),
    move: jest.fn().mockResolvedValue({ success: true }),
    getUrl: jest.fn((filename: string) => `https://example.com/${filename}`),
    getMetadata: jest.fn().mockResolvedValue(null)
  }))
}));

const mockedCreateBaseRepository = createBaseRepository as jest.Mock;

const getRepoConfig = () => {
  mockedCreateBaseRepository.mockClear();
  AssetRepository({ AssetModel: {} as never });
  return mockedCreateBaseRepository.mock.calls[0][0] as {
    toEntity: (doc: Record<string, unknown>) => Record<string, unknown>;
    buildQuery: (filters?: Record<string, unknown>) => Record<string, unknown>;
    getDefaultSort: (filters?: Record<string, unknown>) => Record<string, 1 | -1>;
  };
};

const DUPLICATE_FILENAME = 'kitten.png';
const SPACE_FILENAME = 'space.jpg';
const ASSET_ID = 'asset-id';
const FAKE_ASSET_ID = 'fake-id';
const COMPOSITIONS_FOLDER = 'compositions';
const UPLOADS_FOLDER = 'uploads';
const STORAGE_DELETE_ERROR = 'R2 error';
const DUPLICATE_ASSET_ERROR = `Файл ${DUPLICATE_FILENAME} вже існує`;
const ASSET_DATE = new Date('2026-01-01T00:00:00.000Z');
const USAGE_REFS: [] = [];

const IMAGE_ASSET_DATA = {
  filename: 'test-image.png',
  mimeType: 'image/jpeg',
  sizeBytes: 1024,
  url: 'https://example.com/test-image.png',
  type: 'image' as const
};

const PDF_ASSET_DATA = {
  filename: 'document.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 512,
  url: 'https://example.com/document.pdf',
  type: 'pdf' as const
};

const AUDIO_ASSET_DATA = {
  filename: 'track.mp3',
  mimeType: 'audio/mpeg',
  sizeBytes: 0,
  url: 'https://example.com/compositions/track.mp3',
  type: 'audio' as const
};

const buildAssetDocument = <T extends Record<string, unknown>>(
  data: T,
  id = ASSET_ID,
  date = ASSET_DATE
) => ({
    _id: { toString: () => id },
    tags: [],
    usageRefs: USAGE_REFS,
    ...data,
    isStarred: false,
    createdAt: date,
    updatedAt: date
  });

const MOCK_ASSET_DOC = buildAssetDocument(AUDIO_ASSET_DATA);

const buildFilenameLookupQuery = (filename: string) => ({
  $or: [
    { filename: { $in: [filename] } },
    { originalname: { $in: [filename] } }
  ]
});

describe('AssetRepository', () => {
  describe('createBaseRepository config', () => {
    it('should pass model and handlers into base repository factory', () => {
      const model = {};
      mockedCreateBaseRepository.mockClear();
      AssetRepository({ AssetModel: model as never });

      const config = mockedCreateBaseRepository.mock.calls[0][0] as Record<string, unknown>;

      expect(mockedCreateBaseRepository).toHaveBeenCalledTimes(1);
      expect(config.model).toBe(model);
      expect(typeof config.toEntity).toBe('function');
      expect(typeof config.buildQuery).toBe('function');
      expect(typeof config.getDefaultSort).toBe('function');
    });
  });

  describe('toEntity', () => {
    it('should map document to entity, convert Date fields to ISO and handle null updatedAt', () => {
      const { toEntity } = getRepoConfig();
      const doc = {
        _id: { toString: () => 'asset-id-1' },
        tags: ['archive'],
        usageRefs: [{ pageId: 'about-us', blockId: 'hero' }],
        ...IMAGE_ASSET_DATA,
        filename: 'piano.jpg',
        sizeBytes: 2048,
        url: '/uploads/piano.jpg',
        createdBy: { toString: () => 'admin-id-1' },
        description: 'desc',
        isStarred: true,
        createdAt: new Date('2026-03-10T10:00:00.000Z'),
        updatedAt: null
      };

      const entity = toEntity(doc);

      expect(entity.id).toBe('asset-id-1');
      expect(entity.createdBy).toBe('admin-id-1');
      expect(entity.createdAt).toBe('2026-03-10T10:00:00.000Z');
      expect(entity.updatedAt).toBe(new Date(0).toISOString());
    });

    it('should return string createdAt as-is, convert Date updatedAt and handle missing createdBy', () => {
      const { toEntity } = getRepoConfig();
      const doc = {
        _id: { toString: () => 'asset-id-2' },
        tags: [],
        usageRefs: USAGE_REFS,
        ...PDF_ASSET_DATA,
        filename: 'document.pdf',
        sizeBytes: 512,
        url: '/uploads/document.pdf',
        isStarred: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: new Date('2026-01-02T00:00:00.000Z')
      };

      const entity = toEntity(doc);

      expect(entity.createdBy).toBeUndefined();
      expect(entity.createdAt).toBe('2026-01-01T00:00:00.000Z');
      expect(entity.updatedAt).toBe('2026-01-02T00:00:00.000Z');
    });
  });

  describe('buildQuery', () => {
    it('should return empty query when no filters are given', () => {
      const { buildQuery } = getRepoConfig();
      expect(buildQuery()).toEqual({});
      expect(buildQuery(undefined)).toEqual({});
    });

    it('should build query from type, isStarred, tag and search filters', () => {
      const { buildQuery } = getRepoConfig();
      const query = buildQuery({ type: 'pdf', isStarred: false, tag: 'archive', search: '  press  ' });

      expect(query.type).toBe('pdf');
      expect(query.isStarred).toBe(false);
      expect(query.tags).toBe('archive');
      expect(query.filename).toBeInstanceOf(RegExp);
      expect((query.filename as RegExp).test('press-kit.pdf')).toBe(true);
    });

    it('should set isStarred: true filter', () => {
      const { buildQuery } = getRepoConfig();
      expect(buildQuery({ isStarred: true }).isStarred).toBe(true);
    });

  });

  describe('getDefaultSort', () => {
    it('should return createdAt descending by default', () => {
      const { getDefaultSort } = getRepoConfig();
      expect(getDefaultSort()).toEqual({ createdAt: -1 });
      expect(getDefaultSort({ sortOrder: 'desc' })).toEqual({ createdAt: -1 });
    });

    it('should return sort by custom field and direction', () => {
      const { getDefaultSort } = getRepoConfig();
      expect(getDefaultSort({ sortBy: 'filename', sortOrder: 'asc' })).toEqual({ filename: 1 });
      expect(getDefaultSort({ sortBy: 'updatedAt', sortOrder: 'desc' })).toEqual({ updatedAt: -1 });
    });
  });

  describe('repository methods', () => {
    const mockAssetModel = {
      findById: jest.fn(),
      findByIdAndDelete: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      find: jest.fn(),
      findOneAndUpdate: jest.fn(),
      create: jest.fn()
    };

    const repository = AssetRepository({ AssetModel: mockAssetModel as never });

    let mockStorageDelete: jest.Mock;
    let mockStorageExists: jest.Mock;
    let mockStorageMove: jest.Mock;
    let mockStorageGetUrl: jest.Mock;
    let mockStorageGetMetadata: jest.Mock;

    beforeAll(() => {
      const mockStorage = (createStorageAdapter as jest.Mock).mock.results[0].value;
      mockStorageDelete = mockStorage.delete;
      mockStorageExists = mockStorage.exists;
      mockStorageMove = mockStorage.move;
      mockStorageGetUrl = mockStorage.getUrl;
      mockStorageGetMetadata = mockStorage.getMetadata;
    });

    beforeEach(() => {
      jest.clearAllMocks();
      mockStorageDelete.mockResolvedValue({ success: true });
      mockStorageExists.mockResolvedValue(false);
      mockStorageMove.mockResolvedValue({ success: true });
      mockStorageGetUrl.mockImplementation((filename: string) => `https://example.com/${filename}`);
      mockStorageGetMetadata.mockResolvedValue(null);
      mockAssetModel.find.mockResolvedValue([]);
    });

    describe('deleteAsset', () => {
      it('should throw if asset is not found', async () => {
        mockAssetModel.findById.mockResolvedValueOnce(null);
        await expect(repository.deleteAsset(FAKE_ASSET_ID)).rejects.toThrow('Файл не знайдено');
        expect(mockAssetModel.findByIdAndDelete).not.toHaveBeenCalled();
      });

      it('should log warning and throw when storage delete fails', async () => {
        mockAssetModel.findById.mockResolvedValueOnce({ _id: FAKE_ASSET_ID, filename: 'test.jpg', usageRefs: USAGE_REFS });
        mockStorageDelete.mockResolvedValueOnce({ success: false, error: STORAGE_DELETE_ERROR });

        await expect(repository.deleteAsset(FAKE_ASSET_ID)).rejects.toThrow(
          'The file was not deleted from cloud storage. Please try again later.'
        );
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining(STORAGE_DELETE_ERROR));
        expect(mockAssetModel.findByIdAndDelete).not.toHaveBeenCalled();
      });

      it('should delete asset and return true when asset has no URL', async () => {
        mockAssetModel.findById.mockResolvedValueOnce({
          _id: FAKE_ASSET_ID,
          filename: IMAGE_ASSET_DATA.filename,
          usageRefs: USAGE_REFS
        });
        mockAssetModel.findByIdAndDelete.mockResolvedValueOnce({});

        const result = await repository.deleteAsset(FAKE_ASSET_ID);

        expect(result).toBe(true);
        expect(mockStorageDelete).toHaveBeenCalledWith(IMAGE_ASSET_DATA.filename, UPLOADS_FOLDER);
        expect(mockAssetModel.findByIdAndDelete).toHaveBeenCalledWith(FAKE_ASSET_ID);
      });

      it.each([
        ['https://example.com/photos/piano.jpg', 'piano.jpg', 'photos', 'image'],
        ['https://example.com/photos/my%20track.mp3', 'my track.mp3', 'photos', 'audio'],
        ['https://example.com/photos/%E0%A4%A.jpg', '%E0%A4%A.jpg', 'photos', 'image'],
        ['https://example.com/photos/fallback.jpg', 'fallback.jpg', 'photos', 'image'],
        ['https://example.com/piano.jpg', 'piano.jpg', '', 'image'],
        ['/relative/invalid-url', 'photo.jpg', 'photos', 'image'],
        ['/relative/invalid-url', 'song.mp3', 'compositions', 'audio'],
        ['/relative/invalid-url', 'doc.pdf', 'uploads', 'pdf']
      ])(
        'should resolve correct filename and storage folder for deleteAsset (url=%s -> filename=%s, folder=%s)',
        async (url, filename, expectedFolder, type) => {
          mockAssetModel.findById.mockResolvedValueOnce({ _id: FAKE_ASSET_ID, filename, type, url, usageRefs: USAGE_REFS });
          mockAssetModel.findByIdAndDelete.mockResolvedValueOnce({});

          await repository.deleteAsset(FAKE_ASSET_ID);

          expect(mockStorageDelete).toHaveBeenCalledWith(filename, expectedFolder);
        }
      );
    });

    describe('updateAsset', () => {
      const updatedImageAssetData = {
        ...IMAGE_ASSET_DATA,
        filename: 'updated.jpg',
        url: 'https://example.com/updated.jpg'
      };
      const originalImageData = {
        ...IMAGE_ASSET_DATA,
        filename: 'original.png',
        url: 'https://example.com/photos/original.png'
      };

      it('should handle root level folder in joinStoragePath when renaming', async () => {
        mockAssetModel.findById.mockResolvedValueOnce(
          {
            _id: FAKE_ASSET_ID,
            filename: 'old.jpg',
            mimeType: 'image/jpeg',
            url: 'https://example.com/old.jpg',
            usageRefs: USAGE_REFS
          }
        );
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(
          buildAssetDocument(updatedImageAssetData)
        );

        await repository.updateAsset(ASSET_ID, { filename: 'new.jpg' });

        expect(mockStorageGetUrl).toHaveBeenCalledWith('new.jpg');
      });

      it('should validate renaming file without extension taking falsy nextExtension branch', async () => {
        mockAssetModel.findById.mockResolvedValueOnce({
          _id: FAKE_ASSET_ID,
          filename: 'file',
          mimeType: 'application/octet-stream',
          type: 'document',
          url: 'https://example.com/file',
          usageRefs: USAGE_REFS
        });
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(buildAssetDocument(updatedImageAssetData));

        await repository.updateAsset(ASSET_ID, { filename: 'renamed' });

        expect(mockAssetModel.findByIdAndUpdate).toHaveBeenCalled();
      });

      it('should rename the R2 object and keep the current filename extension', async () => {
        const renamedImageData = {
          ...IMAGE_ASSET_DATA,
          filename: 'old name.jpeg',
          originalname: 'old name.jpeg',
          url: 'https://example.com/photos/old%20name.jpeg'
        };

        mockAssetModel.findById.mockResolvedValueOnce(
          { _id: FAKE_ASSET_ID, usageRefs: USAGE_REFS, ...renamedImageData }
        );
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(buildAssetDocument(updatedImageAssetData));

        await repository.updateAsset('asset-id', { filename: 'new-name.jpeg' });

        expect(mockStorageExists).toHaveBeenCalledWith('new-name.jpeg', 'photos');
        expect(mockStorageMove).toHaveBeenCalledWith('old name.jpeg', 'new-name.jpeg', 'photos');
        expect(mockStorageGetUrl).toHaveBeenCalledWith('photos/new-name.jpeg');
        expect(mockAssetModel.findByIdAndUpdate).toHaveBeenCalledWith(
          'asset-id',
          {
            $set: {
              filename: 'new-name.jpeg',
              originalname: 'new-name.jpeg',
              url: 'https://example.com/photos/new-name.jpeg'
            }
          },
          { new: true }
        );
      });

      it.each([
        ['noextension', 'noextension.png', 'Розширення файлу має залишатися порожнім'],
        ['file.txt', '.file.txt', 'Введіть назву файлу без крапки та розширення'],
        ['file.txt', 'file.txt.', 'Введіть назву файлу без крапки та розширення'],
        ['original.jpeg', 'new-name.ppdf.jpeg', 'Введіть назву файлу без крапки та розширення'],
        ['original.jpeg', 'new-name.png', 'Розширення файлу має залишатися .jpeg']
      ])(
        'should reject invalid rename filenames (current=%s, next=%s)',
        async (currentFilename, nextFilename, expectedErrorMessage) => {
          mockAssetModel.findById.mockResolvedValueOnce({
            _id: FAKE_ASSET_ID,
            filename: currentFilename,
            mimeType: 'application/octet-stream',
            type: 'document',
            url: `https://example.com/${currentFilename}`,
            usageRefs: USAGE_REFS
          });

          await expect(repository.updateAsset('asset-id', { filename: nextFilename })).rejects.toThrow(
            expectedErrorMessage
          );

          expect(mockStorageExists).not.toHaveBeenCalled();
          expect(mockStorageMove).not.toHaveBeenCalled();
          expect(mockAssetModel.findByIdAndUpdate).not.toHaveBeenCalled();
        }
      );

      it('should fallback to existingDoc.url if storage.getUrl returns null', async () => {
        const oldPhotoImageData = {
          ...IMAGE_ASSET_DATA,
          filename: 'old.jpg',
          url: 'https://example.com/photos/old.jpg'
        };

        mockAssetModel.findById.mockResolvedValueOnce({ _id: FAKE_ASSET_ID, usageRefs: USAGE_REFS, ...oldPhotoImageData });
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(buildAssetDocument(updatedImageAssetData));
        mockStorageGetUrl.mockReturnValueOnce(null);

        await repository.updateAsset('asset-id', { filename: 'new.jpg' });

        expect(mockAssetModel.findByIdAndUpdate).toHaveBeenCalledWith(
          'asset-id',
          expect.objectContaining({ $set: expect.objectContaining({ url: oldPhotoImageData.url }) }),
          { new: true }
        );
      });

      it('should return null when renaming a missing document', async () => {
        mockAssetModel.findById.mockResolvedValueOnce(null);

        await expect(repository.updateAsset(ASSET_ID, { filename: 'new-name.png' })).resolves.toBeNull();
        expect(mockStorageMove).not.toHaveBeenCalled();
        expect(mockAssetModel.findByIdAndUpdate).not.toHaveBeenCalled();
      });

      it('should reject duplicate filenames before moving the R2 object', async () => {
        mockAssetModel.findById.mockResolvedValueOnce(
          { _id: FAKE_ASSET_ID, usageRefs: USAGE_REFS, ...originalImageData }
        );
        mockStorageExists.mockResolvedValueOnce(true);

        await expect(repository.updateAsset('asset-id', { filename: 'duplicate.png' })).rejects.toThrow(
          'Файл duplicate.png вже існує'
        );

        expect(mockStorageMove).not.toHaveBeenCalled();
        expect(mockAssetModel.findByIdAndUpdate).not.toHaveBeenCalled();
      });

      it('should not update MongoDB when the R2 rename fails', async () => {
        mockAssetModel.findById.mockResolvedValueOnce(
          { _id: FAKE_ASSET_ID, usageRefs: USAGE_REFS, ...originalImageData }
        );
        mockStorageMove.mockResolvedValueOnce({ success: false, error: 'R2 copy failed' });

        await expect(repository.updateAsset('asset-id', { filename: 'new-name.png' })).rejects.toThrow(
          'The file was not renamed in cloud storage. Please try again later.'
        );

        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('R2 copy failed'));
        expect(mockAssetModel.findByIdAndUpdate).not.toHaveBeenCalled();
      });

      it('should not call findById when filename is not in the update data', async () => {
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(buildAssetDocument(updatedImageAssetData));

        await repository.updateAsset('asset-id', { isStarred: true });

        expect(mockAssetModel.findById).not.toHaveBeenCalled();
      });

      it('should return null when the document is not found', async () => {
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(null);

        const result = await repository.updateAsset('asset-id', { isStarred: true });

        expect(result).toBeNull();
      });

      it('should return entity when document is updated successfully', async () => {
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(buildAssetDocument(updatedImageAssetData));

        const result = await repository.updateAsset('asset-id', { isStarred: false });

        expect(result?.id).toBe('asset-id');
      });
    });

    it('finds and maps assets by URL', async () => {
      mockAssetModel.find.mockResolvedValueOnce([MOCK_ASSET_DOC]);

      await expect(repository.findByUrls(['https://example.com/compositions/track.mp3'])).resolves.toEqual([
        expect.objectContaining({ id: 'asset-id', usageRefs: USAGE_REFS })
      ]);
      expect(mockAssetModel.find).toHaveBeenCalledWith({ url: { $in: ['https://example.com/compositions/track.mp3'] } });
    });

    describe('createAsset', () => {
      const duplicateImageAssetData = {
        ...IMAGE_ASSET_DATA,
        filename: DUPLICATE_FILENAME,
        originalname: DUPLICATE_FILENAME,
        mimeType: 'image/png',
        url: `https://example.com/photos/${DUPLICATE_FILENAME}`
      };
      const legacyDuplicateAssetDoc = {
        _id: FAKE_ASSET_ID,
        filename: '1784204080559-15cd928d217815eb.png',
        originalname: DUPLICATE_FILENAME,
        type: 'image',
        url: 'https://example.com/photos/1784204080559-15cd928d217815eb.png',
        usageRefs: USAGE_REFS
      };

      it('should create asset with default fields and return mapped entity', async () => {
        const newImageAssetData = {
          ...IMAGE_ASSET_DATA,
          filename: 'new-image.jpg',
          url: 'https://example.com/new-image.jpg'
        };

        mockAssetModel.create.mockResolvedValueOnce(buildAssetDocument(newImageAssetData, 'new-asset-id'));

        const result = await repository.createAsset(newImageAssetData);

        expect(mockAssetModel.create).toHaveBeenCalledWith(
          expect.objectContaining({ isStarred: false, tags: [], usageRefs: USAGE_REFS })
        );
        expect(result.id).toBe('new-asset-id');
        expect(result.isStarred).toBe(false);
      });

      it('should use storage upload time and create with the supplied session', async () => {
        const uploadedAt = new Date('2026-04-02T12:00:00.000Z');
        const session = {} as never;
        const { filename, mimeType, sizeBytes, url, type } = MOCK_ASSET_DOC;
        
        mockStorageGetMetadata.mockResolvedValueOnce({ uploadedAt });
        mockAssetModel.create.mockResolvedValueOnce([MOCK_ASSET_DOC]);

        await repository.createAsset({
          filename,
          mimeType,
          sizeBytes,
          url,
          type
        }, session);

        expect(mockStorageGetMetadata).toHaveBeenCalledWith(filename, COMPOSITIONS_FOLDER);
        expect(mockAssetModel.create).toHaveBeenCalledWith(
          [expect.objectContaining({ createdAt: uploadedAt })],
          { session }
        );
      });

      it('should throw duplicate error using filename when originalname is undefined', async () => {
        const assetData = { ...duplicateImageAssetData, originalname: undefined };

        mockAssetModel.find.mockResolvedValueOnce([assetData]);

        await expect(repository.createAsset(assetData)).rejects.toThrow(DUPLICATE_ASSET_ERROR);

        expect(mockAssetModel.find).toHaveBeenCalledWith(buildFilenameLookupQuery(DUPLICATE_FILENAME));
        expect(mockAssetModel.create).not.toHaveBeenCalled();
      });

      it('should filter out undefined and whitespace names in createAsset', async () => {
        const spaceAssetData = {
          ...IMAGE_ASSET_DATA,
          filename: SPACE_FILENAME,
          sizeBytes: 100,
          url: `https://example.com/${SPACE_FILENAME}`
        };

        mockAssetModel.find.mockResolvedValueOnce([]);
        mockAssetModel.create.mockResolvedValueOnce(
          buildAssetDocument(spaceAssetData, 'id', new Date())
        );

        await repository.createAsset({ ...spaceAssetData, originalname: '   ' });

        expect(mockAssetModel.find).toHaveBeenCalledWith(buildFilenameLookupQuery(SPACE_FILENAME));
        expect(mockAssetModel.create).toHaveBeenCalled();
      });

      it('should reject assets that duplicate a legacy original name in the same folder', async () => {
        mockAssetModel.find.mockResolvedValueOnce([
          legacyDuplicateAssetDoc
        ]);

        await expect(
          repository.createAsset(duplicateImageAssetData)
        ).rejects.toThrow(DUPLICATE_ASSET_ERROR);

        expect(mockAssetModel.find).toHaveBeenCalledWith(buildFilenameLookupQuery(DUPLICATE_FILENAME));
        expect(mockAssetModel.create).not.toHaveBeenCalled();
      });

      it('should allow the same original name in a different folder', async () => {
        const duplicatePdfAssetData = {
          ...PDF_ASSET_DATA,
          filename: DUPLICATE_FILENAME,
          originalname: DUPLICATE_FILENAME,
          sizeBytes: 1024,
          url: `https://example.com/documents/${DUPLICATE_FILENAME}`
        };

        mockAssetModel.find.mockResolvedValueOnce([
          legacyDuplicateAssetDoc
        ]);
        mockAssetModel.create.mockResolvedValueOnce(buildAssetDocument(duplicatePdfAssetData, 'new-doc-id'));

        const result = await repository.createAsset(duplicatePdfAssetData);

        expect(result.id).toBe('new-doc-id');
        expect(mockAssetModel.find).toHaveBeenCalledWith(buildFilenameLookupQuery(DUPLICATE_FILENAME));
        expect(mockAssetModel.create).toHaveBeenCalled();
      });
    });

  });
});
