import { createCloudStorage } from '../cloudStorage';
import { createStorageAdapter, createStorageFromEnv } from '../storageFactory';
import { StorageConfig } from '../types';

jest.mock('@azure/storage-blob');
jest.mock('../../../middleware/logger/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));
jest.mock('../cloudStorage');
jest.mock('../azureBlobStorage');

const mockCreateCloudStorage = createCloudStorage as jest.MockedFunction<typeof createCloudStorage>;

describe('storageFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createStorageAdapter', () => {
    const mockAdapter = {
      store: jest.fn(),
      retrieve: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      getMetadata: jest.fn(),
      getUrl: jest.fn(),
      list: jest.fn()
    };

    describe('cloud storage', () => {
      it('should create AWS cloud storage adapter', () => {
        const config: StorageConfig = {
          type: 'cloud',
          cloudProvider: 'aws',
          cloudConfig: {
            bucket: 'test-bucket',
            region: 'us-east-1',
            credentials: {
              accessKeyId: 'test-key',
              secretAccessKey: 'test-secret'
            }
          },
          baseUrl: 'https://cdn.example.com'
        };

        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        const adapter = createStorageAdapter(config);

        expect(createCloudStorage).toHaveBeenCalledWith({
          provider: 'aws',
          bucket: 'test-bucket',
          region: 'us-east-1',
          endpoint: undefined,
          credentials: {
            accessKeyId: 'test-key',
            secretAccessKey: 'test-secret'
          },
          baseUrl: 'https://cdn.example.com'
        });
        expect(adapter).toBe(mockAdapter);
      });

      it('should create Cloudflare R2 cloud storage adapter', () => {
        const config: StorageConfig = {
          type: 'cloud',
          cloudProvider: 'cloudflare',
          cloudConfig: {
            bucket: 'test-bucket',
            endpoint: 'https://abc123.r2.cloudflarestorage.com',
            credentials: {
              accessKeyId: 'test-key',
              secretAccessKey: 'test-secret'
            }
          }
        };

        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        const adapter = createStorageAdapter(config);

        expect(createCloudStorage).toHaveBeenCalledWith({
          provider: 'cloudflare',
          bucket: 'test-bucket',
          region: undefined,
          endpoint: 'https://abc123.r2.cloudflarestorage.com',
          credentials: {
            accessKeyId: 'test-key',
            secretAccessKey: 'test-secret'
          },
          baseUrl: undefined
        });
        expect(adapter).toBe(mockAdapter);
      });

      it('should throw error if cloudProvider is missing', () => {
        const config: StorageConfig = {
          type: 'cloud',
          cloudConfig: {
            bucket: 'test-bucket'
          }
        };

        expect(() => createStorageAdapter(config)).toThrow('Cloud storage requires cloudProvider and cloudConfig');
      });

      it('should throw error if cloudConfig is missing', () => {
        const config: StorageConfig = {
          type: 'cloud',
          cloudProvider: 'aws'
        };

        expect(() => createStorageAdapter(config)).toThrow('Cloud storage requires cloudProvider and cloudConfig');
      });

      it('should use empty string for bucket if not provided', () => {
        const config: StorageConfig = {
          type: 'cloud',
          cloudProvider: 'aws',
          cloudConfig: {
            credentials: {
              accessKeyId: 'test-key',
              secretAccessKey: 'test-secret'
            }
          }
        };

        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        createStorageAdapter(config);

        expect(createCloudStorage).toHaveBeenCalledWith(
          expect.objectContaining({
            bucket: ''
          })
        );
      });

      it('should create GCP cloud storage adapter', () => {
        const config: StorageConfig = {
          type: 'cloud',
          cloudProvider: 'gcp',
          cloudConfig: {
            bucket: 'test-bucket',
            credentials: {
              projectId: 'test-project'
            }
          }
        };

        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        createStorageAdapter(config);

        expect(createCloudStorage).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: 'gcp',
            bucket: 'test-bucket'
          })
        );
      });

      it('should create Azure cloud storage adapter', () => {
        const config: StorageConfig = {
          type: 'cloud',
          cloudProvider: 'azure',
          cloudConfig: {
            bucket: 'test-bucket',
            credentials: {
              accessKeyId: 'test-key',
              secretAccessKey: 'test-secret'
            }
          }
        };

        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        createStorageAdapter(config);

        expect(createCloudStorage).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: 'azure',
            bucket: 'test-bucket'
          })
        );
      });
    });

    describe('unknown storage type', () => {
      it('should throw error for unknown storage type', () => {
        const config: StorageConfig = {
          type: 'unknown' as any
        };

        expect(() => createStorageAdapter(config)).toThrow('Unknown storage type: unknown');
      });
    });
  });

  describe('createStorageFromEnv', () => {
    const originalEnv = process.env;
    const mockAdapter = {
      store: jest.fn(),
      retrieve: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      getMetadata: jest.fn(),
      getUrl: jest.fn(),
      list: jest.fn()
    };

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    describe('development environment', () => {
      it('should create cloud storage by default in development', () => {
        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        const adapter = createStorageFromEnv();

        expect(createCloudStorage).toHaveBeenCalled();
        expect(adapter).toBe(mockAdapter);
      });

      it('should create cloud storage with environment variables', () => {
        process.env.STORAGE_TYPE = 'cloud';
        process.env.CLOUD_PROVIDER = 'aws';
        process.env.CLOUD_BUCKET = 'dev-bucket';
        process.env.CLOUD_REGION = 'us-west-1';
        process.env.CLOUD_ACCESS_KEY = 'dev-key';
        process.env.CLOUD_SECRET_KEY = 'dev-secret';

        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv();

        expect(createCloudStorage).toHaveBeenCalledWith({
          provider: 'aws',
          bucket: 'dev-bucket',
          region: 'us-west-1',
          endpoint: undefined,
          credentials: {
            accessKeyId: 'dev-key',
            secretAccessKey: 'dev-secret',
            token: undefined,
            projectId: undefined
          },
          baseUrl: undefined
        });
      });

      it('should default to aws for cloud provider', () => {
        process.env.STORAGE_TYPE = 'cloud';
        process.env.CLOUD_BUCKET = 'dev-bucket';

        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv();

        expect(createCloudStorage).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: 'aws'
          })
        );
      });
    });

    describe('production environment', () => {
      it('should create cloud storage by default in production', () => {
        process.env.CLOUD_PROVIDER = 'aws';
        process.env.CLOUD_BUCKET = 'prod-bucket';

        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv();

        expect(createCloudStorage).toHaveBeenCalled();
      });

      it('should use environment variables in production', () => {
        process.env.STORAGE_TYPE = 'cloud';
        process.env.CLOUD_PROVIDER = 'cloudflare';
        process.env.CLOUD_BUCKET = 'prod-bucket';
        process.env.CLOUD_ENDPOINT = 'https://prod.r2.cloudflarestorage.com';
        process.env.CLOUD_ACCESS_KEY = 'prod-key';
        process.env.CLOUD_SECRET_KEY = 'prod-secret';
        process.env.STORAGE_BASE_URL = 'https://cdn.example.com';

        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv();

        expect(createCloudStorage).toHaveBeenCalledWith({
          provider: 'cloudflare',
          bucket: 'prod-bucket',
          region: undefined,
          endpoint: 'https://prod.r2.cloudflarestorage.com',
          credentials: {
            accessKeyId: 'prod-key',
            secretAccessKey: 'prod-secret',
            token: undefined,
            projectId: undefined
          },
          baseUrl: 'https://cdn.example.com'
        });
      });

      it('should include all cloud credentials', () => {
        process.env.STORAGE_TYPE = 'cloud';
        process.env.CLOUD_PROVIDER = 'gcp';
        process.env.CLOUD_BUCKET = 'prod-bucket';
        process.env.CLOUDFLARE_TOKEN = 'cf-token';
        process.env.CLOUD_PROJECT_ID = 'gcp-project-123';

        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv();

        expect(createCloudStorage).toHaveBeenCalledWith(
          expect.objectContaining({
            credentials: expect.objectContaining({
              token: 'cf-token',
              projectId: 'gcp-project-123'
            })
          })
        );
      });
    });

    describe('default environment', () => {
      it('should default to development if no environment specified', () => {
        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv();

        expect(createCloudStorage).toHaveBeenCalled();
      });
    });

    describe('edge cases', () => {
      it('should handle missing environment variables gracefully', () => {
        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        const adapter = createStorageFromEnv();

        expect(adapter).toBeDefined();
      });
    });
  });
});
