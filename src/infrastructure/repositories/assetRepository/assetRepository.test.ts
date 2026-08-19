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
    getUrl: jest.fn((filename: string) => `https://example.com/${filename}`)
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
        type: 'image',
        tags: ['archive'],
        usageRefs: [{ pageId: 'about-us', blockId: 'hero' }],
        filename: 'piano.jpg',
        mimeType: 'image/jpeg',
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
        type: 'pdf',
        tags: [],
        usageRefs: [],
        filename: 'document.pdf',
        mimeType: 'application/pdf',
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

    it('should build isUsed filter using $exists operator', () => {
      const { buildQuery } = getRepoConfig();

      const usedQuery = buildQuery({ isUsed: true });
      expect(usedQuery['usageRefs.0']).toEqual({ $exists: true });

      const unusedQuery = buildQuery({ isUsed: false });
      expect(unusedQuery['usageRefs.0']).toEqual({ $exists: false });
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

    beforeAll(() => {
      const mockStorage = (createStorageAdapter as jest.Mock).mock.results[0].value;
      mockStorageDelete = mockStorage.delete;
      mockStorageExists = mockStorage.exists;
      mockStorageMove = mockStorage.move;
      mockStorageGetUrl = mockStorage.getUrl;
    });

    beforeEach(() => {
      jest.clearAllMocks();
      mockStorageDelete.mockResolvedValue({ success: true });
      mockStorageExists.mockResolvedValue(false);
      mockStorageMove.mockResolvedValue({ success: true });
      mockStorageGetUrl.mockImplementation((filename: string) => `https://example.com/${filename}`);
      mockAssetModel.find.mockResolvedValue([]);
    });

    describe('deleteAsset', () => {
      it('should throw if asset is not found', async () => {
        mockAssetModel.findById.mockResolvedValueOnce(null);
        await expect(repository.deleteAsset('fake-id')).rejects.toThrow('Файл не знайдено');
      });

      it('should throw and skip deletion if asset is in use', async () => {
        mockAssetModel.findById.mockResolvedValueOnce({ usageRefs: [{ pageId: 'some-page' }] });

        await expect(repository.deleteAsset('fake-id')).rejects.toThrow('Cannot delete: file is in use on the site.');
        expect(mockAssetModel.findByIdAndDelete).not.toHaveBeenCalled();
      });

      it('should log warning and throw when storage delete fails', async () => {
        mockAssetModel.findById.mockResolvedValueOnce({
          _id: 'fake-id',
          filename: 'test.jpg',
          type: 'image',
          usageRefs: []
        });
        mockStorageDelete.mockResolvedValueOnce({ success: false, error: 'R2 error' });

        await expect(repository.deleteAsset('fake-id')).rejects.toThrow(
          'The file was not deleted from cloud storage. Please try again later.'
        );
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('R2 error'));
        expect(mockAssetModel.findByIdAndDelete).not.toHaveBeenCalled();
      });

      it('should delete asset and return true when asset has no URL', async () => {
        mockAssetModel.findById.mockResolvedValueOnce({
          _id: 'fake-id',
          filename: 'test-image.png',
          type: 'image',
          usageRefs: []
        });
        mockAssetModel.findByIdAndDelete.mockResolvedValueOnce({});

        const result = await repository.deleteAsset('fake-id');

        expect(result).toBe(true);
        expect(mockStorageDelete).toHaveBeenCalledWith('test-image.png', 'uploads');
        expect(mockAssetModel.findByIdAndDelete).toHaveBeenCalledWith('fake-id');
      });

      it.each([
        ['https://example.com/photos/piano.jpg', 'piano.jpg', 'photos', 'image'],
        ['https://example.com/photos/%E0%A4%A.jpg', '%E0%A4%A.jpg', 'photos', 'image'],
        ['https://example.com/photos/fallback.jpg', 'fallback.jpg', 'photos', 'image'],
        ['https://example.com/piano.jpg', 'piano.jpg', '', 'image'],
        ['/relative/invalid-url', 'photo.jpg', 'photos', 'image'],
        ['/relative/invalid-url', 'song.mp3', 'compositions', 'audio'],
        ['/relative/invalid-url', 'doc.pdf', 'uploads', 'pdf']
      ])(
        'should resolve correct filename and storage folder for deleteAsset (url=%s -> filename=%s, folder=%s)',
        async (url, filename, expectedFolder, type) => {
          mockAssetModel.findById.mockResolvedValueOnce({
            _id: 'fake-id',
            filename,
            type,
            url,
            usageRefs: []
          });
          mockAssetModel.findByIdAndDelete.mockResolvedValueOnce({});

          await repository.deleteAsset('fake-id');

          expect(mockStorageDelete).toHaveBeenCalledWith(filename, expectedFolder);
        }
      );
    });

    describe('updateAsset', () => {
      const updatedDoc = {
        _id: { toString: () => 'asset-id' },
        type: 'image' as const,
        tags: [],
        usageRefs: [],
        filename: 'updated.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
        url: 'https://example.com/updated.jpg',
        isStarred: false,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z')
      };

      it('should handle root level folder in joinStoragePath when renaming', async () => {
        mockAssetModel.findById.mockResolvedValueOnce({
          filename: 'old.jpg',
          mimeType: 'image/jpeg',
          type: 'image',
          url: 'https://example.com/old.jpg',
          usageRefs: []
        });
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(updatedDoc);

        await repository.updateAsset('asset-id', { filename: 'new.jpg' });

        expect(mockStorageGetUrl).toHaveBeenCalledWith('new.jpg');
      });

      it('should validate renaming file without extension taking falsy nextExtension branch', async () => {
        mockAssetModel.findById.mockResolvedValueOnce({
          filename: 'file',
          mimeType: 'application/octet-stream',
          type: 'document',
          url: 'https://example.com/file',
          usageRefs: []
        });
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(updatedDoc);

        await repository.updateAsset('asset-id', { filename: 'renamed' });

        expect(mockAssetModel.findByIdAndUpdate).toHaveBeenCalled();
      });

      it('should rename the R2 object and keep the current filename extension', async () => {
        mockAssetModel.findById.mockResolvedValueOnce({
          filename: 'old name.jpeg',
          originalname: 'old name.jpeg',
          mimeType: 'image/jpeg',
          type: 'image',
          url: 'https://example.com/photos/old%20name.jpeg',
          usageRefs: []
        });
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(updatedDoc);

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
            filename: currentFilename,
            mimeType: 'application/octet-stream',
            type: 'document',
            url: `https://example.com/${currentFilename}`,
            usageRefs: []
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
        mockAssetModel.findById.mockResolvedValueOnce({
          filename: 'old.jpg',
          mimeType: 'image/jpeg',
          type: 'image',
          url: 'https://example.com/photos/old.jpg',
          usageRefs: []
        });
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(updatedDoc);
        mockStorageGetUrl.mockReturnValueOnce(null);

        await repository.updateAsset('asset-id', { filename: 'new.jpg' });

        expect(mockAssetModel.findByIdAndUpdate).toHaveBeenCalledWith(
          'asset-id',
          expect.objectContaining({ $set: expect.objectContaining({ url: 'https://example.com/photos/old.jpg' }) }),
          { new: true }
        );
      });

      it('should return null when renaming a missing document', async () => {
        mockAssetModel.findById.mockResolvedValueOnce(null);

        const result = await repository.updateAsset('asset-id', { filename: 'new-name.png' });

        expect(result).toBeNull();
        expect(mockStorageMove).not.toHaveBeenCalled();
        expect(mockAssetModel.findByIdAndUpdate).not.toHaveBeenCalled();
      });

      it('should reject duplicate filenames before moving the R2 object', async () => {
        mockAssetModel.findById.mockResolvedValueOnce({
          filename: 'original.png',
          mimeType: 'image/png',
          type: 'image',
          url: 'https://example.com/photos/original.png',
          usageRefs: []
        });
        mockStorageExists.mockResolvedValueOnce(true);

        await expect(repository.updateAsset('asset-id', { filename: 'duplicate.png' })).rejects.toThrow(
          'Файл duplicate.png вже існує'
        );

        expect(mockStorageMove).not.toHaveBeenCalled();
        expect(mockAssetModel.findByIdAndUpdate).not.toHaveBeenCalled();
      });

      it('should not update MongoDB when the R2 rename fails', async () => {
        mockAssetModel.findById.mockResolvedValueOnce({
          filename: 'original.png',
          mimeType: 'image/png',
          type: 'image',
          url: 'https://example.com/photos/original.png',
          usageRefs: []
        });
        mockStorageMove.mockResolvedValueOnce({ success: false, error: 'R2 copy failed' });

        await expect(repository.updateAsset('asset-id', { filename: 'new-name.png' })).rejects.toThrow(
          'The file was not renamed in cloud storage. Please try again later.'
        );

        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('R2 copy failed'));
        expect(mockAssetModel.findByIdAndUpdate).not.toHaveBeenCalled();
      });

      it('should block renaming files that are already in use', async () => {
        mockAssetModel.findById.mockResolvedValueOnce({
          filename: 'used.png',
          mimeType: 'image/png',
          type: 'image',
          url: 'https://example.com/photos/used.png',
          usageRefs: [{ pageId: 'about' }]
        });

        await expect(repository.updateAsset('asset-id', { filename: 'new-name.png' })).rejects.toThrow(
          'Cannot rename: file is in use on the site.'
        );

        expect(mockStorageExists).not.toHaveBeenCalled();
        expect(mockStorageMove).not.toHaveBeenCalled();
        expect(mockAssetModel.findByIdAndUpdate).not.toHaveBeenCalled();
      });

      it('should not call findById when filename is not in the update data', async () => {
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(updatedDoc);

        await repository.updateAsset('asset-id', { isStarred: true });

        expect(mockAssetModel.findById).not.toHaveBeenCalled();
      });

      it('should return null when the document is not found', async () => {
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(null);

        const result = await repository.updateAsset('asset-id', { isStarred: true });

        expect(result).toBeNull();
      });

      it('should return entity when document is updated successfully', async () => {
        mockAssetModel.findByIdAndUpdate.mockResolvedValueOnce(updatedDoc);

        const result = await repository.updateAsset('asset-id', { isStarred: false });

        expect(result?.id).toBe('asset-id');
      });
    });

    describe('createAsset', () => {
      it('should create asset with default fields and return mapped entity', async () => {
        const newDoc = {
          _id: { toString: () => 'new-asset-id' },
          type: 'image' as const,
          tags: [],
          usageRefs: [],
          filename: 'new-image.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
          url: 'https://example.com/new-image.jpg',
          isStarred: false,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z')
        };
        mockAssetModel.create.mockResolvedValueOnce(newDoc);

        const result = await repository.createAsset({
          filename: 'new-image.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
          url: 'https://example.com/new-image.jpg',
          type: 'image'
        });

        expect(mockAssetModel.create).toHaveBeenCalledWith(
          expect.objectContaining({ isStarred: false, tags: [], usageRefs: [] })
        );
        expect(result.id).toBe('new-asset-id');
        expect(result.isStarred).toBe(false);
      });

      it('should throw duplicate error using filename when originalname is undefined', async () => {
        mockAssetModel.find.mockResolvedValueOnce([
          {
            filename: 'kitten.png',
            type: 'image',
            url: 'https://example.com/photos/kitten.png'
          }
        ]);

        await expect(
          repository.createAsset({
            filename: 'kitten.png',
            mimeType: 'image/png',
            sizeBytes: 1024,
            url: 'https://example.com/photos/kitten.png',
            type: 'image'
          })
        ).rejects.toThrow('Файл kitten.png вже існує');
      });

      it('should filter out undefined and whitespace names in createAsset', async () => {
        const newDoc = {
          _id: { toString: () => 'id' },
          type: 'image' as const,
          tags: [],
          usageRefs: [],
          filename: 'space.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 100,
          url: 'https://example.com/space.jpg',
          isStarred: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        mockAssetModel.find.mockResolvedValueOnce([]);
        mockAssetModel.create.mockResolvedValueOnce(newDoc);

        await repository.createAsset({
          filename: 'space.jpg',
          originalname: '   ',
          mimeType: 'image/jpeg',
          sizeBytes: 100,
          url: 'https://example.com/space.jpg',
          type: 'image'
        });

        expect(mockAssetModel.create).toHaveBeenCalled();
      });

      it('should reject assets that duplicate a legacy original name in the same folder', async () => {
        mockAssetModel.find.mockResolvedValueOnce([
          {
            filename: '1784204080559-15cd928d217815eb.png',
            originalname: 'kitten.png',
            type: 'image',
            url: 'https://example.com/photos/1784204080559-15cd928d217815eb.png'
          }
        ]);

        await expect(
          repository.createAsset({
            filename: 'kitten.png',
            originalname: 'kitten.png',
            mimeType: 'image/png',
            sizeBytes: 1024,
            url: 'https://example.com/photos/kitten.png',
            type: 'image'
          })
        ).rejects.toThrow('Файл kitten.png вже існує');

        expect(mockAssetModel.create).not.toHaveBeenCalled();
      });

      it('should allow the same original name in a different folder', async () => {
        const newDoc = {
          _id: { toString: () => 'new-doc-id' },
          type: 'pdf' as const,
          tags: [],
          usageRefs: [],
          filename: 'kitten.png',
          originalname: 'kitten.png',
          mimeType: 'application/pdf',
          sizeBytes: 1024,
          url: 'https://example.com/documents/kitten.png',
          isStarred: false,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z')
        };

        mockAssetModel.find.mockResolvedValueOnce([
          {
            filename: '1784204080559-15cd928d217815eb.png',
            originalname: 'kitten.png',
            type: 'image',
            url: 'https://example.com/photos/1784204080559-15cd928d217815eb.png'
          }
        ]);
        mockAssetModel.create.mockResolvedValueOnce(newDoc);

        const result = await repository.createAsset({
          filename: 'kitten.png',
          originalname: 'kitten.png',
          mimeType: 'application/pdf',
          sizeBytes: 1024,
          url: 'https://example.com/documents/kitten.png',
          type: 'pdf'
        });

        expect(result.id).toBe('new-doc-id');
        expect(mockAssetModel.create).toHaveBeenCalled();
      });
    });

    describe('addUsageRef', () => {
      it('should call findOneAndUpdate with $addToSet on usageRefs', async () => {
        mockAssetModel.findOneAndUpdate.mockResolvedValueOnce({});

        await repository.addUsageRef('https://example.com/photo.jpg', { pageId: 'about', blockId: 'hero' });

        expect(mockAssetModel.findOneAndUpdate).toHaveBeenCalledWith(
          { url: 'https://example.com/photo.jpg' },
          { $addToSet: { usageRefs: { pageId: 'about', blockId: 'hero' } } },
          { session: undefined }
        );
      });
    });
  });
});
