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
const STORAGE_BASE_URL = 'https://example.com';

const IMAGE_ASSET_DATA = {
  filename: 'test-image.png',
  mimeType: 'image/jpeg',
  sizeBytes: 1024,
  url: `${STORAGE_BASE_URL}/photos/test-image.png`,
  type: 'image' as const
};

const PDF_ASSET_DATA = {
  filename: 'document.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 512,
  url: `${STORAGE_BASE_URL}/document.pdf`,
  type: 'pdf' as const
};

const AUDIO_ASSET_DATA = {
  filename: 'track.mp3',
  mimeType: 'audio/mpeg',
  sizeBytes: 0,
  url: `${STORAGE_BASE_URL}/compositions/track.mp3`,
  type: 'audio' as const
};

const buildAssetDocument = <T extends Record<string, unknown>>(
  data: T,
  id = ASSET_ID,
  date = ASSET_DATE,
  overrides: Record<string, unknown> = {}
) => ({
    _id: { toString: () => id },
    tags: [],
    usageRefs: USAGE_REFS,
    ...data,
    isStarred: false,
    createdAt: date,
    updatedAt: date,
    ...overrides
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
    const model = {};
    let config: Record<string, unknown>;

    beforeEach(() => {
      mockedCreateBaseRepository.mockClear();
      AssetRepository({ AssetModel: model as never });

      config = mockedCreateBaseRepository.mock.calls[0][0] as Record<string, unknown>;
    });

    it('should pass model into base repository factory', () => {
      expect(mockedCreateBaseRepository).toHaveBeenCalledTimes(1);
      expect(config.model).toBe(model);
    });

    it.each(['toEntity', 'buildQuery', 'getDefaultSort'])('should pass %s handler into base repository factory', (handler) => {
      expect(typeof config[handler]).toBe('function');
    });
  });

  describe('toEntity', () => {
    it('should convert id and Date fields and handle null updatedAt', () => {
      const { toEntity } = getRepoConfig();
      const doc = buildAssetDocument(
        { ...IMAGE_ASSET_DATA, createdBy: { toString: () => 'admin-id-1' } },
        'asset-id-1',
        new Date('2026-03-10T10:00:00.000Z'),
        { updatedAt: null }
      );

      expect(toEntity(doc)).toMatchObject({
        id: 'asset-id-1',
        createdBy: 'admin-id-1',
        createdAt: '2026-03-10T10:00:00.000Z',
        updatedAt: new Date(0).toISOString()
      });
    });

    it('should preserve string createdAt and handle missing createdBy', () => {
      const { toEntity } = getRepoConfig();
      const doc = {
        ...buildAssetDocument(PDF_ASSET_DATA, 'asset-id-2'),
        createdAt: ASSET_DATE.toISOString()
      };

      expect(toEntity(doc)).toMatchObject({
        createdBy: undefined,
        createdAt: ASSET_DATE.toISOString(),
        updatedAt: ASSET_DATE.toISOString()
      });
    });
  });

  describe('buildQuery', () => {
    it.each([undefined, {}])('should return empty query for filters=%o', (filters) => {
      const { buildQuery } = getRepoConfig();
      expect(buildQuery(filters)).toEqual({});
    });

    it('should build query from type, isStarred, tag and search filters', () => {
      const { buildQuery } = getRepoConfig();
      const query = buildQuery({ type: 'pdf', isStarred: false, tag: 'archive', search: '  press  ' });

      expect(query).toEqual({
        type: 'pdf',
        isStarred: false,
        tags: 'archive',
        filename: /press/i
      });
    });

    it('should set isStarred: true filter', () => {
      const { buildQuery } = getRepoConfig();
      expect(buildQuery({ isStarred: true }).isStarred).toBe(true);
    });

  });

  describe('getDefaultSort', () => {
    it.each([
      [undefined, { createdAt: -1 }],
      [{ sortOrder: 'desc' }, { createdAt: -1 }],
      [{ sortBy: 'filename', sortOrder: 'asc' }, { filename: 1 }],
      [{ sortBy: 'updatedAt', sortOrder: 'desc' }, { updatedAt: -1 }]
    ])('should return the expected sort for filters=%o', (filters, expectedSort) => {
      const { getDefaultSort } = getRepoConfig();
      expect(getDefaultSort(filters)).toEqual(expectedSort);
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
      mockStorageGetUrl.mockImplementation((filename: string) => `${STORAGE_BASE_URL}/${filename}`);
      mockStorageGetMetadata.mockResolvedValue(null);
      mockAssetModel.find.mockResolvedValue([]);
      mockAssetModel.findByIdAndUpdate.mockReset();
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
        [`${STORAGE_BASE_URL}/photos/piano.jpg`, 'piano.jpg', 'photos', 'image'],
        [`${STORAGE_BASE_URL}/photos/my%20track.mp3`, 'my track.mp3', 'photos', 'audio'],
        [`${STORAGE_BASE_URL}/photos/%E0%A4%A.jpg`, '%E0%A4%A.jpg', 'photos', 'image'],
        [`${STORAGE_BASE_URL}/photos/fallback.jpg`, 'fallback.jpg', 'photos', 'image'],
        [`${STORAGE_BASE_URL}/piano.jpg`, 'piano.jpg', '', 'image'],
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
      it('should generate a root-level storage URL when renaming an asset without a folder', async () => {
        mockAssetModel.findById.mockResolvedValueOnce(PDF_ASSET_DATA);
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(
          buildAssetDocument(IMAGE_ASSET_DATA)
        );

        await repository.updateAsset(ASSET_ID, { filename: 'new.pdf' });

        expect(mockStorageGetUrl).toHaveBeenCalledWith('new.pdf');
      });

      it('should rename an asset without an extension when the new name also has no extension', async () => {
        mockAssetModel.findById.mockResolvedValueOnce({
          ...IMAGE_ASSET_DATA,
          filename: 'file',
          mimeType: 'application/octet-stream',
          url: `${STORAGE_BASE_URL}/photos/file`
        });
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(buildAssetDocument(IMAGE_ASSET_DATA));

        await repository.updateAsset(ASSET_ID, { filename: 'renamed' });

        expect(mockAssetModel.findByIdAndUpdate).toHaveBeenCalledWith(
          ASSET_ID,
          {
            $set: {
              filename: 'renamed',
              originalname: 'renamed',
              url: `${STORAGE_BASE_URL}/photos/renamed`
            }
          },
          { new: true }
        );
      });

      it('should rename the R2 object and keep the current filename extension', async () => {
        const nextFilename = 'new-name.png';
        const nextUrl = `${STORAGE_BASE_URL}/photos/${nextFilename}`;

        mockAssetModel.findById.mockResolvedValueOnce(IMAGE_ASSET_DATA);
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(buildAssetDocument(IMAGE_ASSET_DATA));

        await repository.updateAsset(ASSET_ID, { filename: nextFilename });
        expect(mockStorageMove).toHaveBeenCalledWith(IMAGE_ASSET_DATA.filename, nextFilename, 'photos');
        expect(mockAssetModel.findByIdAndUpdate).toHaveBeenCalledWith(
          ASSET_ID,
          {
            $set: {
              filename: nextFilename,
              originalname: nextFilename,
              url: nextUrl
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
            url: `${STORAGE_BASE_URL}/${currentFilename}`,
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
          url: `${STORAGE_BASE_URL}/photos/old.jpg`
        };

        mockAssetModel.findById.mockResolvedValueOnce({ _id: FAKE_ASSET_ID, usageRefs: USAGE_REFS, ...oldPhotoImageData });
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(buildAssetDocument(IMAGE_ASSET_DATA));
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
          { _id: FAKE_ASSET_ID, usageRefs: USAGE_REFS, ...IMAGE_ASSET_DATA }
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
          { _id: FAKE_ASSET_ID, usageRefs: USAGE_REFS, ...IMAGE_ASSET_DATA }
        );
        mockStorageMove.mockResolvedValueOnce({ success: false, error: 'R2 copy failed' });

        await expect(repository.updateAsset('asset-id', { filename: 'new-name.png' })).rejects.toThrow(
          'The file was not renamed in cloud storage. Please try again later.'
        );

        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('R2 copy failed'));
        expect(mockAssetModel.findByIdAndUpdate).not.toHaveBeenCalled();
      });

      it('should not call findById when filename is not in the update data', async () => {
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(buildAssetDocument(IMAGE_ASSET_DATA));

        await repository.updateAsset('asset-id', { isStarred: true });

        expect(mockAssetModel.findById).not.toHaveBeenCalled();
      });

      it('should return null when the document is not found', async () => {
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(null);

        const result = await repository.updateAsset('asset-id', { isStarred: true });

        expect(result).toBeNull();
      });

      it('should return entity when document is updated successfully', async () => {
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(buildAssetDocument(IMAGE_ASSET_DATA));

        const result = await repository.updateAsset('asset-id', { isStarred: false });

        expect(result?.id).toBe('asset-id');
      });
    });

    it('finds and maps assets by URL', async () => {
      mockAssetModel.find.mockResolvedValueOnce([
        { ...MOCK_ASSET_DOC, createdAt: ASSET_DATE.toISOString() }
      ]);

      await expect(repository.findByUrls([`${STORAGE_BASE_URL}/compositions/track.mp3`])).resolves.toEqual([
        expect.objectContaining({ id: 'asset-id', usageRefs: USAGE_REFS })
      ]);
      expect(mockAssetModel.find).toHaveBeenCalledWith({ url: { $in: [`${STORAGE_BASE_URL}/compositions/track.mp3`] } });
    });

    describe('createAsset', () => {
      const duplicateImageAssetData = {
        ...IMAGE_ASSET_DATA,
        filename: DUPLICATE_FILENAME,
        originalname: DUPLICATE_FILENAME,
        url: `${STORAGE_BASE_URL}/photos/${DUPLICATE_FILENAME}`
      };
      
      it('should create asset with default fields and return mapped entity', async () => {
        mockAssetModel.create.mockResolvedValueOnce(buildAssetDocument(IMAGE_ASSET_DATA, 'new-asset-id'));

        const result = await repository.createAsset(IMAGE_ASSET_DATA);

        expect(mockAssetModel.create).toHaveBeenCalledWith(
          expect.objectContaining({ isStarred: false, tags: [], usageRefs: USAGE_REFS })
        );
        expect(result.id).toBe('new-asset-id');
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

        expect(mockAssetModel.create).not.toHaveBeenCalled();
      });

      it('should filter out whitespace originalname in createAsset', async () => {
        const spaceAssetData = {
          ...IMAGE_ASSET_DATA,
          filename: SPACE_FILENAME,
          originalname: '   '
        };

        mockAssetModel.find.mockResolvedValueOnce([]);
        mockAssetModel.create.mockResolvedValueOnce(
          buildAssetDocument(spaceAssetData, 'id')
        );
        await repository.createAsset(spaceAssetData);

        expect(mockAssetModel.find).toHaveBeenCalledWith(buildFilenameLookupQuery(SPACE_FILENAME));
      });

      it('should reject assets that duplicate a filename in the same folder', async () => {
        mockAssetModel.find.mockResolvedValueOnce([
          {
            filename: DUPLICATE_FILENAME,
            url: `${STORAGE_BASE_URL}/photos/${DUPLICATE_FILENAME}`
          }
        ]);

        await expect(
          repository.createAsset(duplicateImageAssetData)
        ).rejects.toThrow(DUPLICATE_ASSET_ERROR);

        expect(mockAssetModel.create).not.toHaveBeenCalled();
      });

      it('should allow the same original name in a different folder', async () => {
        const duplicatePdfAssetData = {
          ...PDF_ASSET_DATA,
          filename: DUPLICATE_FILENAME,
          originalname: DUPLICATE_FILENAME,
          url: `${STORAGE_BASE_URL}/documents/${DUPLICATE_FILENAME}`
        };

        mockAssetModel.find.mockResolvedValueOnce([
          {
            filename: DUPLICATE_FILENAME,
            url: `${STORAGE_BASE_URL}/photos/${DUPLICATE_FILENAME}`
          }
        ]);
        mockAssetModel.create.mockResolvedValueOnce(buildAssetDocument(duplicatePdfAssetData, 'new-doc-id'));

        await expect(repository.createAsset(duplicatePdfAssetData)).resolves.toMatchObject({ id: 'new-doc-id' });

        expect(mockAssetModel.find).toHaveBeenCalledWith(
          buildFilenameLookupQuery(DUPLICATE_FILENAME)
        );
      });
    });
  });
});
