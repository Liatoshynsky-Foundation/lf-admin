import { UPLOAD_ERRORS } from '../../errors';
import { AzureBlobStorageAdapter } from '../azureBlobStorage';
import { createStorageAdapter, createStorageFromEnv } from '../storageFactory';
import { StorageConfig } from '../types';

jest.mock('../../../middleware/logger/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  default: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: jest.fn(),
}));
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
}));

describe('Storage Provider Switching', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('createStorageAdapter (Manual Config)', () => {
    it('should create Azure adapter with correct properties', () => {
      const config: StorageConfig = {
        type: 'azure-blob',
        azureContainerName: 'test-container',
        azureFolderPrefix: 'custom-uploads',
        baseUrl: 'https://cdn.example.com'
      };

      const adapter = createStorageAdapter(config);

      const azureAdapter = adapter as AzureBlobStorageAdapter;
      expect(azureAdapter).toHaveProperty('copyBlobsToNewFolder');
      expect(azureAdapter).toHaveProperty('streamBlob');
      expect(azureAdapter.store).toBeDefined();
    });

    it('should create Cloud adapter for AWS S3', () => {
      const config: StorageConfig = {
        type: 'cloud',
        cloudProvider: 'aws',
        cloudConfig: {
          bucket: 'aws-bucket',
          region: 'eu-central-1',
          credentials: {
            accessKeyId: 'aws-key',
            secretAccessKey: 'aws-secret'
          }
        }
      };

      const adapter = createStorageAdapter(config);
      expect(adapter).toBeDefined();
      expect(adapter.getUrl('file.txt')).toContain('aws-bucket.s3.eu-central-1.amazonaws.com');
    });

    it('should create Cloud adapter for Cloudflare R2 with endpoint', () => {
      const config: StorageConfig = {
        type: 'cloud',
        cloudProvider: 'cloudflare',
        cloudConfig: {
          bucket: 'r2-bucket',
          endpoint: 'https://account.r2.cloudflarestorage.com',
          credentials: {
            accessKeyId: 'r2-key',
            secretAccessKey: 'r2-secret'
          }
        }
      };

      const adapter = createStorageAdapter(config);
      expect(adapter).toBeDefined();
      expect(adapter.getUrl('file.txt')).toContain('r2.cloudflarestorage.com');
    });

    it('should throw error if cloudProvider is missing for cloud type', () => {
      const invalidConfig = {
        type: 'cloud',
        cloudConfig: { bucket: 'test' }
      } as StorageConfig;

      expect(() => createStorageAdapter(invalidConfig))
        .toThrow(UPLOAD_ERRORS.CLOUD_STORAGE_REQUIRES_CONFIG);
    });

    it('should throw error for unknown storage type', () => {
      const unknownConfig = {
        type: 'unknown-provider'
      } as unknown as StorageConfig;

      expect(() => createStorageAdapter(unknownConfig))
        .toThrow(UPLOAD_ERRORS.UNKNOWN_STORAGE_TYPE('unknown-provider'));
    });
  });

  describe('createStorageFromEnv (Environment Config)', () => {
    it('should initialize Azure storage from process.env', () => {
      process.env.STORAGE_TYPE = 'azure-blob';
      process.env.AZURE_CONTAINER_NAME = 'env-container';
      process.env.AZURE_SAS_URL = 'https://env.blob.core.windows.net?sas';

      const adapter = createStorageFromEnv();

      expect(adapter).toBeDefined();
      expect((adapter as AzureBlobStorageAdapter).constructBlobUrl).toBeDefined();
    });

    it('should initialize Cloudflare storage from process.env', () => {
      process.env.STORAGE_TYPE = 'cloud';
      process.env.CLOUD_PROVIDER = 'cloudflare';
      process.env.CLOUD_BUCKET = 'env-r2-bucket';
      process.env.CLOUD_ENDPOINT = 'https://env.r2.cloudflarestorage.com';
      process.env.CLOUD_ACCESS_KEY = 'env-access';
      process.env.CLOUD_SECRET_KEY = 'env-secret';

      const adapter = createStorageFromEnv();

      expect(adapter).toBeDefined();
      const url = adapter.getUrl('test.png');
      expect(url).toContain('env.r2.cloudflarestorage.com');
    });

    it('should default to cloud/aws if STORAGE_TYPE is not set', () => {
      delete process.env.STORAGE_TYPE;
      process.env.CLOUD_BUCKET = 'default-bucket';
      process.env.CLOUD_ACCESS_KEY = 'key';
      process.env.CLOUD_SECRET_KEY = 'secret';

      const adapter = createStorageFromEnv();

      expect(adapter).toBeDefined();
      expect(adapter.getUrl('file.jpg')).toContain('s3.us-east-1.amazonaws.com');
    });

    it('should correctly apply STORAGE_BASE_URL if provided', () => {
      process.env.STORAGE_TYPE = 'azure-blob';
      process.env.AZURE_CONTAINER_NAME = 'test';
      process.env.STORAGE_BASE_URL = 'https://my-proxy.com';
      process.env.AZURE_SAS_URL = 'https://test.blob.core.windows.net?sas';

      const adapter = createStorageFromEnv();

      expect(adapter.getUrl('image.png')).toBe('https://my-proxy.com/image.png');
    });
  });
});