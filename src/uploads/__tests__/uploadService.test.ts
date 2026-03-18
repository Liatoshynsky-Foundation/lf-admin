import { StorageAdapter, StorageMetadata, StorageResult } from '../storage/types';
import { UploadedFile } from '../types';
import { createUploadService, UploadService } from '../uploadService';
import { FileValidator, ValidationResult } from '../validators/common';
import { createValidator } from '../validators/validatorFactory';

jest.mock('../validators/validatorFactory');
const mockedCreateValidator = createValidator as jest.MockedFunction<typeof createValidator>;

describe('UploadService', () => {
  const mockStorage: jest.Mocked<StorageAdapter> = {
    store: jest.fn(),
    retrieve: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    getMetadata: jest.fn(),
    getUrl: jest.fn(),
    list: jest.fn(),
  };

  const mockValidator: jest.Mocked<FileValidator> = {
    validate: jest.fn(),
  };

  let service: UploadService;

  const testFile: UploadedFile = {
    buffer: Buffer.from('test content'),
    originalname: 'test.jpg',
    mimetype: 'image/jpeg',
    fieldname: 'file',
    encoding: '7bit',
    size: 12,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedCreateValidator.mockReturnValue(mockValidator);
    service = createUploadService({
      storage: mockStorage,
      defaultFileType: 'image',
    });
  });

  describe('uploadFile', () => {
    it('should successfully upload a file when validation and storage succeed', async () => {
      const validResult: ValidationResult = { valid: true, errors: [] };
      const storageResult: StorageResult = {
        success: true,
        metadata: {
          filename: 'unique-test.jpg',
          size: 12,
          mimeType: 'image/jpeg',
          uploadedAt: new Date(),
          originalName: 'test.jpg',
          url: 'http://example.com/test.jpg'
        } as StorageMetadata
      };

      mockValidator.validate.mockResolvedValue(validResult);
      mockStorage.store.mockResolvedValue(storageResult);

      const result = await service.uploadFile(testFile);

      expect(result.success).toBe(true);
      expect(result.filename).toBe('unique-test.jpg');
      expect(mockStorage.store).toHaveBeenCalled();
    });

    it('should return error and not call storage if validation fails', async () => {
      mockValidator.validate.mockResolvedValue({ valid: false, errors: ['File too large'] });

      const result = await service.uploadFile(testFile);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('File too large');
      expect(mockStorage.store).not.toHaveBeenCalled();
    });

    it('should return error if storage service fails', async () => {
      mockValidator.validate.mockResolvedValue({ valid: true, errors: [] });
      mockStorage.store.mockResolvedValue({
        success: false,
        error: 'S3 Connection Error',
        metadata: {} as StorageMetadata
      });

      const result = await service.uploadFile(testFile);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('S3 Connection Error');
    });

    it('should catch and wrap unexpected exceptions', async () => {
      mockValidator.validate.mockRejectedValue(new Error('Unexpected Crash'));

      const result = await service.uploadFile(testFile);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Unexpected Crash');
    });
  });

  describe('Storage Delegation Methods', () => {
    it('should delegate retrieveFile to storage', async () => {
      const buffer = Buffer.from('data');
      mockStorage.retrieve.mockResolvedValue(buffer);

      const result = await service.retrieveFile('file.txt');

      expect(result).toBe(buffer);
      expect(mockStorage.retrieve).toHaveBeenCalledWith('file.txt', undefined);
    });

    it('should delegate deleteFile and return boolean success', async () => {
      mockStorage.delete.mockResolvedValue({ success: true });

      const result = await service.deleteFile('file.txt');

      expect(result).toBe(true);
      expect(mockStorage.delete).toHaveBeenCalledWith('file.txt', undefined);
    });

    it('should delegate fileExists correctly', async () => {
      mockStorage.exists.mockResolvedValue(true);
      expect(await service.fileExists('test.png')).toBe(true);
    });

    it('should delegate getFileUrl', () => {
      mockStorage.getUrl.mockReturnValue('http://cdn.com/test.png');
      expect(service.getFileUrl('test.png')).toBe('http://cdn.com/test.png');
    });
  });
});