import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';

import { CloudStorageOptions, createCloudStorage } from '../cloudStorage';

jest.mock('@aws-sdk/client-s3');
jest.mock('~/src/middleware/logger/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn()
  }
}));

const MockS3Client = S3Client as jest.MockedClass<typeof S3Client>;
const MockPutObjectCommand = PutObjectCommand as jest.MockedClass<typeof PutObjectCommand>;
const MockGetObjectCommand = GetObjectCommand as jest.MockedClass<typeof GetObjectCommand>;
const MockDeleteObjectCommand = DeleteObjectCommand as jest.MockedClass<typeof DeleteObjectCommand>;
const MockHeadObjectCommand = HeadObjectCommand as jest.MockedClass<typeof HeadObjectCommand>;
const MockListObjectsV2Command = ListObjectsV2Command as jest.MockedClass<typeof ListObjectsV2Command>;

const createAwsOptions = (overrides?: Partial<CloudStorageOptions>): CloudStorageOptions => ({
  provider: 'aws',
  bucket: 'test-bucket',
  credentials: {
    accessKeyId: 'test-key',
    secretAccessKey: 'test-secret'
  },
  ...overrides
});

const createCloudflareOptions = (overrides?: Partial<CloudStorageOptions>): CloudStorageOptions => ({
  provider: 'cloudflare',
  bucket: 'test-bucket',
  endpoint: 'https://abc123.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'test-key',
    secretAccessKey: 'test-secret'
  },
  ...overrides
});

const createTestFile = () => ({
  buffer: Buffer.from('test content'),
  filename: 'test.txt',
  mimeType: 'text/plain'
});

const mockConsoleError = () => jest.spyOn(console, 'error').mockImplementation();
const mockConsoleLog = () => jest.spyOn(console, 'log').mockImplementation();

describe('createCloudStorage', () => {
  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend = jest.fn();
    MockS3Client.prototype.send = mockSend;
  });

  describe('initialization', () => {
    it('should create AWS storage successfully', async () => {
      const options = createAwsOptions({ region: 'us-east-1' });
      const storage = createCloudStorage(options);

      mockSend.mockResolvedValueOnce({});
      await storage.exists('test.txt');

      expect(storage).toBeDefined();
      expect(MockS3Client).toHaveBeenCalledWith(
        expect.objectContaining({
          region: 'us-east-1',
          credentials: {
            accessKeyId: 'test-key',
            secretAccessKey: 'test-secret'
          }
        })
      );
    });

    it('should reuse the same S3 client between operations', async () => {
      const options = createAwsOptions({ region: 'us-east-1' });
      const storage = createCloudStorage(options);

      mockSend.mockResolvedValue({});

      await storage.exists('first.txt');
      await storage.exists('second.txt');

      expect(MockS3Client).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it('should create Cloudflare R2 storage successfully', async () => {
      const options = createCloudflareOptions();
      const storage = createCloudStorage(options);

      mockSend.mockResolvedValueOnce({});
      await storage.exists('test.txt');

      expect(storage).toBeDefined();
      expect(MockS3Client).toHaveBeenCalledWith(
        expect.objectContaining({
          region: 'auto',
          credentials: {
            accessKeyId: 'test-key',
            secretAccessKey: 'test-secret'
          },
          endpoint: 'https://abc123.r2.cloudflarestorage.com'
        })
      );
    });

    it('should return error if AWS credentials are missing', async () => {
      const options = createAwsOptions({ credentials: {} });
      const storage = createCloudStorage(options);

      const result = await storage.delete('test.txt');

      expect(result.success).toBe(false);
      expect(result.error).toContain('aws storage requires accessKeyId and secretAccessKey');
    });

    it('should return error if Cloudflare credentials are missing', async () => {
      const options = createCloudflareOptions({ credentials: {} });
      const storage = createCloudStorage(options);

      const result = await storage.delete('test.txt');

      expect(result.success).toBe(false);
      expect(result.error).toContain('cloudflare storage requires accessKeyId and secretAccessKey');
    });

    it('should return error if Cloudflare endpoint is missing', async () => {
      const options = createCloudflareOptions({ endpoint: undefined });
      const storage = createCloudStorage(options);

      const result = await storage.delete('test.txt');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cloudflare R2 storage requires endpoint configuration');
    });
  });

  describe('store', () => {
    it('should store file to AWS successfully', async () => {
      const options = createAwsOptions({ region: 'us-east-1' });
      const storage = createCloudStorage(options);
      const { buffer, filename, mimeType } = createTestFile();

      mockSend.mockResolvedValue({});

      const result = await storage.store(buffer, filename, mimeType);

      expect(result.success).toBe(true);
      expect(result.metadata.filename).toBe(filename);
      expect(result.metadata.mimeType).toBe(mimeType);
      expect(result.metadata.size).toBe(buffer.length);
      expect(result.metadata.path).toBe('uploads/test.txt');
      expect(result.metadata.directory).toBe('uploads');
      expect(result.metadata.originalFilename).toBe(filename);
      expect(result.metadata.originalMimeType).toBe(mimeType);
      expect(result.metadata.processed).toBe(true);
      expect(MockPutObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: `uploads/${filename}`,
        Body: buffer,
        ContentType: mimeType,
        Metadata: expect.objectContaining({
          originalName: filename,
          uploadedAt: expect.any(String)
        })
      });
    });

    it('should store file to Cloudflare R2 successfully', async () => {
      const options = createCloudflareOptions();
      const storage = createCloudStorage(options);
      const { buffer, filename, mimeType } = createTestFile();

      mockSend.mockResolvedValue({});

      const result = await storage.store(buffer, filename, mimeType);

      expect(result.success).toBe(true);
      expect(result.metadata.path).toBe('uploads/test.txt');
      expect(result.metadata.directory).toBe('uploads');
      expect(result.metadata.originalFilename).toBe(filename);
      expect(result.metadata.originalMimeType).toBe(mimeType);
      expect(result.metadata.processed).toBe(true);
      expect(MockPutObjectCommand).toHaveBeenCalled();
    });

    it('should include custom metadata', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);
      const { buffer, filename, mimeType } = createTestFile();
      const metadata = {
        originalName: 'original.txt',
        userId: '123'
      };

      mockSend.mockResolvedValue({});

      await storage.store(buffer, filename, mimeType, metadata);

      expect(MockPutObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: `uploads/${filename}`,
        Body: buffer,
        ContentType: mimeType,
        Metadata: expect.objectContaining({
          originalName: 'original.txt',
          userId: '123',
          uploadedAt: expect.any(String)
        })
      });
    });

    it('should store file in metadata directory when provided', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);
      const { buffer, filename, mimeType } = createTestFile();

      mockSend.mockResolvedValue({});

      const result = await storage.store(buffer, filename, mimeType, { directory: 'custom-folder' });

      expect(result.metadata.path).toBe('custom-folder/test.txt');
      expect(result.metadata.directory).toBe('custom-folder');
      expect(MockPutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: 'test-bucket',
          Key: 'custom-folder/test.txt'
        })
      );
    });

    it('should include URL in metadata', async () => {
      const options = createAwsOptions({ region: 'us-west-2' });
      const storage = createCloudStorage(options);
      const { buffer, filename, mimeType } = createTestFile();

      mockSend.mockResolvedValue({});

      const result = await storage.store(buffer, filename, mimeType);

      expect(result.metadata.url).toBe('https://test-bucket.s3.us-west-2.amazonaws.com/uploads/test.txt');
    });

    it('should handle storage errors', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);
      const { buffer, filename, mimeType } = createTestFile();

      mockSend.mockRejectedValue(new Error('Network error'));

      const result = await storage.store(buffer, filename, mimeType);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should throw error for unsupported providers', async () => {
      // Використовуємо unknown замість any для безпечного приведення типів
      const options = createAwsOptions({ provider: 'gcp' as unknown as CloudStorageOptions['provider'] });
      const storage = createCloudStorage(options);
      const { buffer } = createTestFile();

      const result = await storage.store(buffer, 'test.txt', 'text/plain');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cloud storage for gcp not yet implemented');
    });
  });

  describe('retrieve', () => {
    it('should retrieve file from AWS successfully', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);
      const { filename } = createTestFile();
      const expectedContent = Buffer.from('test content');

      const mockStream = Readable.from([expectedContent]);
      mockSend.mockResolvedValue({ Body: mockStream });

      const result = await storage.retrieve(filename);

      expect(result).toEqual(expectedContent);
      expect(MockGetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: `uploads/${filename}`
      });
    });

    it('should return null if file body is empty', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);
      const consoleSpy = mockConsoleError();

      mockSend.mockResolvedValue({ Body: null });

      const result = await storage.retrieve('test.txt');

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it('should handle retrieve errors', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);
      const consoleSpy = mockConsoleError();

      mockSend.mockRejectedValue(new Error('File not found'));

      const result = await storage.retrieve('test.txt');

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it('should return null for unsupported providers', async () => {
      const options = createAwsOptions({ provider: 'unsupported' as unknown as CloudStorageOptions['provider'] });
      const storage = createCloudStorage(options);
      const consoleSpy = mockConsoleError();

      const result = await storage.retrieve('test.txt');

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('delete', () => {
    it('should delete file from AWS successfully', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);
      const { filename } = createTestFile();

      mockSend.mockResolvedValue({});

      const result = await storage.delete(filename);

      expect(result.success).toBe(true);
      expect(MockDeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: `uploads/${filename}`
      });
    });

    it('should handle delete errors', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);

      mockSend.mockRejectedValue(new Error('Access denied'));

      const result = await storage.delete('test.txt');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Access denied');
    });

    it('should throw error for unsupported providers', async () => {
      const options: CloudStorageOptions = {
        provider: 'gcp',
        bucket: 'test-bucket',
        credentials: {
          accessKeyId: 'test-key',
          secretAccessKey: 'test-secret'
        }
      };

      const storage = createCloudStorage(options);

      const result = await storage.delete('test.txt');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cloud storage for gcp not yet implemented');
    });
  });

  describe('exists', () => {
    it('should return true if file exists', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);
      const consoleSpy = mockConsoleLog();

      mockSend.mockResolvedValue({});

      const result = await storage.exists('test.txt');

      expect(result).toBe(true);
      expect(MockHeadObjectCommand).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should return false if file does not exist', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);
      const consoleSpy = mockConsoleLog();

      mockSend.mockRejectedValue(new Error('Not found'));

      const result = await storage.exists('test.txt');

      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });

    it('should return false for unsupported providers', async () => {
      const options = createAwsOptions({ provider: 'gcp' as unknown as CloudStorageOptions['provider'] });
      const storage = createCloudStorage(options);
      const consoleSpy = mockConsoleLog();

      const result = await storage.exists('test.txt');

      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('getMetadata', () => {
    it('should retrieve metadata successfully', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);
      const consoleSpy = mockConsoleError();

      mockSend.mockResolvedValue({
        ContentType: 'text/plain',
        ContentLength: 100,
        LastModified: new Date('2025-12-09'),
        Metadata: {
          originalName: 'original.txt'
        }
      });

      const result = await storage.getMetadata('test.txt');

      expect(result).toMatchObject({
        filename: 'test.txt',
        originalName: 'original.txt',
        mimeType: 'text/plain',
        size: 100,
        path: 'uploads/test.txt',
        directory: 'uploads',
        originalFilename: 'original.txt',
        originalMimeType: 'text/plain',
        processed: true
      });
      consoleSpy.mockRestore();
    });

    it('should use default values for missing metadata', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);
      const consoleSpy = mockConsoleError();

      mockSend.mockResolvedValue({});

      const result = await storage.getMetadata('test.txt');

      expect(result?.mimeType).toBe('application/octet-stream');
      expect(result?.size).toBe(0);
      consoleSpy.mockRestore();
    });

    it('should return null on error', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);
      const consoleSpy = mockConsoleError();

      mockSend.mockRejectedValue(new Error('Not found'));

      const result = await storage.getMetadata('test.txt');

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it('should return null for unsupported providers', async () => {
      const options = createAwsOptions({ provider: 'unsupported' as unknown as CloudStorageOptions['provider'] });
      const storage = createCloudStorage(options);
      const consoleSpy = mockConsoleError();

      const result = await storage.getMetadata('test.txt');

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('getUrl', () => {
    it('should generate correct URL for AWS with custom baseUrl', () => {
      const options = createAwsOptions({ baseUrl: 'https://cdn.example.com' });
      const storage = createCloudStorage(options);
      const url = storage.getUrl('test.txt');

      expect(url).toBe('https://cdn.example.com/test.txt');
    });

    it('should generate default AWS S3 URL', () => {
      const options = createAwsOptions({ region: 'us-west-2' });
      const storage = createCloudStorage(options);
      const url = storage.getUrl('test.txt');

      expect(url).toBe('https://test-bucket.s3.us-west-2.amazonaws.com/test.txt');
    });

    it('should use us-east-1 as default region for AWS', () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);
      const url = storage.getUrl('test.txt');

      expect(url).toBe('https://test-bucket.s3.us-east-1.amazonaws.com/test.txt');
    });

    it('should generate correct URL for Cloudflare R2 with custom baseUrl', () => {
      const options = createCloudflareOptions({ baseUrl: 'https://r2.example.com' });
      const storage = createCloudStorage(options);
      const url = storage.getUrl('test.txt');

      expect(url).toBe('https://r2.example.com/test.txt');
    });

    it('should generate Cloudflare R2 endpoint URL', () => {
      const options = createCloudflareOptions();
      const storage = createCloudStorage(options);
      const url = storage.getUrl('test.txt');

      expect(url).toBe('https://abc123.r2.cloudflarestorage.com/test.txt');
    });

    it('should generate default Cloudflare R2 dev URL', () => {
      const options = createCloudflareOptions({ endpoint: 'https://invalid-endpoint.com' });
      const storage = createCloudStorage(options);
      const url = storage.getUrl('test.txt');

      expect(url).toBe('https://test-bucket.r2.dev/test.txt');
    });

    it('should generate correct URL for GCP', () => {
      const options = createAwsOptions({ provider: 'gcp' as unknown as CloudStorageOptions['provider'], credentials: {} });
      const storage = createCloudStorage(options);
      const url = storage.getUrl('test.txt');

      expect(url).toBe('https://storage.googleapis.com/test-bucket/test.txt');
    });

    it('should generate correct URL for GCP with custom baseUrl', () => {
      const options = createAwsOptions({
        provider: 'gcp' as unknown as CloudStorageOptions['provider'],
        baseUrl: 'https://cdn.gcp.example.com',
        credentials: {}
      });
      const storage = createCloudStorage(options);
      const url = storage.getUrl('test.txt');

      expect(url).toBe('https://cdn.gcp.example.com/test.txt');
    });

    it('should generate correct URL for unsupported providers with custom baseUrl', () => {
      const options = createAwsOptions({
        provider: 'unsupported' as unknown as CloudStorageOptions['provider'],
        baseUrl: 'https://cdn.example.com',
        credentials: {}
      });
      const storage = createCloudStorage(options);
      const url = storage.getUrl('test.txt');

      expect(url).toBe('https://cdn.example.com/test.txt');
    });

    it('should return null for unsupported providers without custom baseUrl', () => {
      const options = createAwsOptions({
        provider: 'unsupported' as unknown as CloudStorageOptions['provider'],
        credentials: {}
      });
      const storage = createCloudStorage(options);
      const url = storage.getUrl('test.txt');

      expect(url).toBeNull();
    });
  });

  describe('list', () => {
    it('should list files from the root folder', async () => {
      const options = createAwsOptions({ region: 'us-west-2' });
      const storage = createCloudStorage(options);
      const uploadedAt = new Date('2026-07-20');

      mockSend.mockResolvedValue({
        Contents: [
          {
            Key: 'uploads/test.txt',
            Size: 42,
            LastModified: uploadedAt
          }
        ]
      });

      const result = await storage.list();

      expect(MockListObjectsV2Command).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Prefix: ''
      });
      expect(result).toEqual([
        {
          filename: 'test.txt',
          originalName: 'test.txt',
          mimeType: 'application/octet-stream',
          size: 42,
          uploadedAt,
          path: 'uploads/test.txt',
          url: 'https://test-bucket.s3.us-west-2.amazonaws.com/uploads/test.txt',
          directory: 'uploads'
        }
      ]);
    });

    it('should normalize folder prefix when listing files', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);

      mockSend.mockResolvedValue({ Contents: [] });

      const result = await storage.list('photos');

      expect(result).toEqual([]);
      expect(MockListObjectsV2Command).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Prefix: 'photos/'
      });
    });

    it('should keep trailing slash in folder prefix when listing files', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);

      mockSend.mockResolvedValue({ Contents: [] });

      await storage.list('photos/');

      expect(MockListObjectsV2Command).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Prefix: 'photos/'
      });
    });

    it('should use default values when listed object metadata is missing', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);

      mockSend.mockResolvedValue({
        Contents: [
          {
            Key: undefined,
            Size: undefined,
            LastModified: undefined
          }
        ]
      });

      const result = await storage.list();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        filename: '',
        originalName: '',
        mimeType: 'application/octet-stream',
        size: 0,
        path: '',
        url: 'https://test-bucket.s3.us-east-1.amazonaws.com/',
        directory: ''
      });
      expect(result[0].uploadedAt).toBeInstanceOf(Date);
    });

    it('should return an empty array when list fails', async () => {
      const options = createAwsOptions();
      const storage = createCloudStorage(options);

      mockSend.mockRejectedValue(new Error('List failed'));

      const result = await storage.list();

      expect(result).toEqual([]);
    });
  });
});
