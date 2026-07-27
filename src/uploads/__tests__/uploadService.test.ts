import { UPLOAD_ERRORS } from '../errors';
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
    move: jest.fn(),
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
    mockStorage.exists.mockResolvedValue(false);
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
          url: 'https://example.com/test.jpg'
        } as StorageMetadata
      };

      mockValidator.validate.mockResolvedValue(validResult);
      mockStorage.store.mockResolvedValue(storageResult);

      const result = await service.uploadFile(testFile);

      expect(result.success).toBe(true);
      expect(result.filename).toBe('unique-test.jpg');
      expect(mockStorage.store).toHaveBeenCalledWith(
        testFile.buffer,
        'test.jpg',
        'image/jpeg',
        expect.objectContaining({ originalName: 'test.jpg' })
      );
    });

    it('should preserve the uploaded file name and extension when storing the file', async () => {
      const jpegFile: UploadedFile = {
        ...testFile,
        originalname: ' Test_image_1.jpeg ',
        mimetype: 'image/jpeg'
      };

      mockValidator.validate.mockResolvedValue({ valid: true, errors: [] });
      mockStorage.store.mockResolvedValue({
        success: true,
        metadata: {
          filename: 'Test_image_1.jpeg',
          size: 12,
          mimeType: 'image/jpeg',
          uploadedAt: new Date(),
          originalName: ' Test_image_1.jpeg ',
          url: 'https://example.com/photos/Test_image_1.jpeg'
        } as StorageMetadata
      });

      await service.uploadFile(jpegFile);

      expect(mockStorage.store).toHaveBeenCalledWith(
        jpegFile.buffer,
        'Test_image_1.jpeg',
        'image/jpeg',
        expect.objectContaining({ originalName: ' Test_image_1.jpeg ' })
      );
    });

    it('should return conflict and skip storage when file already exists', async () => {
      mockValidator.validate.mockResolvedValue({ valid: true, errors: [] });
      mockStorage.exists.mockResolvedValue(true);

      const result = await service.uploadFile(testFile, { directory: 'photos' });

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(409);
      expect(result.errors).toContain(UPLOAD_ERRORS.FILE_ALREADY_EXISTS('test.jpg'));
      expect(mockStorage.exists).toHaveBeenCalledWith('test.jpg', 'photos');
      expect(mockStorage.store).not.toHaveBeenCalled();
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

    it('should return default storage error if storage fails without a message', async () => {
      mockValidator.validate.mockResolvedValue({ valid: true, errors: [] });
      mockStorage.store.mockResolvedValue({
        success: false,
        metadata: {} as StorageMetadata
      });

      const result = await service.uploadFile(testFile);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(UPLOAD_ERRORS.STORAGE_FAILED);
    });

    it('should catch and wrap unexpected exceptions', async () => {
      mockValidator.validate.mockRejectedValue(new Error('Unexpected Crash'));

      const result = await service.uploadFile(testFile);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Unexpected Crash');
    });
  });

  describe('uploadFiles (Multiple)', () => {
    it('should successfully upload multiple files', async () => {
      const files: UploadedFile[] = [
        { ...testFile, originalname: '1.jpg' },
        { ...testFile, originalname: '2.jpg' }
      ];

      mockValidator.validate.mockResolvedValue({ valid: true, errors: [] });
      mockStorage.store.mockImplementation(async (buf, name) => ({
        success: true,
        metadata: { filename: `unique-${name}`, size: buf.length } as StorageMetadata
      }));

      const results = await service.uploadFiles(files);

      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
      expect(mockStorage.store).toHaveBeenCalledTimes(2);
    });

    it('should return mixed results if some files fail validation', async () => {
      const files: UploadedFile[] = [
        { ...testFile, originalname: 'valid.jpg' },
        { ...testFile, originalname: 'invalid.jpg' }
      ];

      mockValidator.validate
        .mockResolvedValueOnce({ valid: true, errors: [] })
        .mockResolvedValueOnce({ valid: false, errors: ['Invalid type'] });

      mockStorage.store.mockResolvedValue({
        success: true,
        metadata: { filename: 'valid.jpg' } as StorageMetadata
      });

      const results = await service.uploadFiles(files);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].errors).toContain('Invalid type');
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
      mockStorage.getUrl.mockReturnValue('https://cdn.com/test.png');
      expect(service.getFileUrl('test.png')).toBe('https://cdn.com/test.png');
    });

    it('should delegate getFileMetadata', async () => {
      const meta = { filename: 'test.jpg' } as StorageMetadata;
      mockStorage.getMetadata.mockResolvedValue(meta);

      const result = await service.getFileMetadata('test.jpg');
      expect(result).toBe(meta);
      expect(mockStorage.getMetadata).toHaveBeenCalledWith('test.jpg', undefined);
    });

    it('should delegate listFiles', async () => {
      const list = [{ filename: '1.jpg' } as StorageMetadata];
      mockStorage.list.mockResolvedValue(list);

      const result = await service.listFiles('uploads');
      expect(result).toBe(list);
      expect(mockStorage.list).toHaveBeenCalledWith('uploads');
    });
  });

  describe('UploadService Edge Cases', () => {
    it('should use default image file type when config does not provide it', async () => {
      service = createUploadService({ storage: mockStorage });
      mockValidator.validate.mockResolvedValue({ valid: true, errors: [] });
      mockStorage.store.mockResolvedValue({
        success: true,
        metadata: { filename: 'test.jpg' } as StorageMetadata
      });

      await service.uploadFile(testFile);

      expect(mockedCreateValidator).toHaveBeenCalledWith({
        fileType: 'image',
        rules: {}
      });
    });

    it('should prefer file type and validation rules from upload options', async () => {
      mockValidator.validate.mockResolvedValue({ valid: true, errors: [] });
      mockStorage.store.mockResolvedValue({
        success: true,
        metadata: { filename: 'audio.mp3' } as StorageMetadata
      });

      await service.uploadFile(
        { ...testFile, originalname: 'audio.mp3', mimetype: 'audio/mpeg' },
        { fileType: 'audio', validationRules: { maxSize: 1024 } }
      );

      expect(mockedCreateValidator).toHaveBeenCalledWith({
        fileType: 'audio',
        rules: { maxSize: 1024 }
      });
    });

    it('should use a custom filename generator when provided', async () => {
      mockValidator.validate.mockResolvedValue({ valid: true, errors: [] });
      mockStorage.store.mockResolvedValue({
        success: true,
        metadata: { filename: 'custom-name.jpg' } as StorageMetadata
      });

      await service.uploadFile(testFile, {
        generateFilename: () => 'custom-name.jpg'
      });

      expect(mockStorage.store).toHaveBeenCalledWith(
        expect.any(Buffer),
        'custom-name.jpg',
        'image/jpeg',
        expect.objectContaining({ originalName: 'test.jpg' })
      );
    });

    it('should apply custom directory from options to storage metadata', async () => {
      mockValidator.validate.mockResolvedValue({ valid: true, errors: [] });
      mockStorage.store.mockResolvedValue({
        success: true,
        metadata: { filename: 'user-1/test.jpg' } as StorageMetadata
      });

      await service.uploadFile(testFile, { directory: 'user-1' });

      expect(mockStorage.store).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ directory: 'user-1' })
      );
    });

    it('should return default unknown error if thrown value is an Error object', async () => {
      mockValidator.validate.mockImplementation(() => { throw new Error('string-error'); });

      const result = await service.uploadFile(testFile);
      expect(result.errors).toContain('string-error');
    });

    it('should return UPLOAD_ERRORS.UNKNOWN_ERROR if a non-Error is thrown', async () => {
      mockValidator.validate.mockImplementation(() => {
        throw 'string-error';
      });

      const result = await service.uploadFile(testFile);
      expect(result.errors).toContain(UPLOAD_ERRORS.UNKNOWN_ERROR);
    });
  });
});
