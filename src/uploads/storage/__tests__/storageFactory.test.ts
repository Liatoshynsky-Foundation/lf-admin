import { createCloudStorage } from '../cloudStorage';
import { createDockerStorage } from '../dockerStorage';
import { createLocalStorage } from '../localStorage';
import { createStorageAdapter, createStorageFromEnv } from '../storageFactory';
import { StorageConfig } from '../types';

jest.mock('../cloudStorage');
jest.mock('../dockerStorage');
jest.mock('../localStorage');

const mockCreateCloudStorage = createCloudStorage as jest.MockedFunction<typeof createCloudStorage>;
const mockCreateDockerStorage = createDockerStorage as jest.MockedFunction<typeof createDockerStorage>;
const mockCreateLocalStorage = createLocalStorage as jest.MockedFunction<typeof createLocalStorage>;

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
      getUrl: jest.fn()
    };

    describe('local storage', () => {
      it('should create local storage adapter', () => {
        const config: StorageConfig = {
          type: 'local',
          localPath: '/tmp/uploads',
          baseUrl: 'http://localhost:3000/uploads'
        };

        mockCreateLocalStorage.mockReturnValue(mockAdapter);

        const adapter = createStorageAdapter(config);

        expect(createLocalStorage).toHaveBeenCalledWith({
          basePath: '/tmp/uploads',
          baseUrl: 'http://localhost:3000/uploads'
        });
        expect(adapter).toBe(mockAdapter);
      });

      it('should throw error if localPath is missing', () => {
        const config: StorageConfig = {
          type: 'local'
        };

        expect(() => createStorageAdapter(config)).toThrow('Local storage requires localPath in config');
      });

      it('should create local storage without baseUrl', () => {
        const config: StorageConfig = {
          type: 'local',
          localPath: '/tmp/uploads'
        };

        mockCreateLocalStorage.mockReturnValue(mockAdapter);

        createStorageAdapter(config);

        expect(createLocalStorage).toHaveBeenCalledWith({
          basePath: '/tmp/uploads',
          baseUrl: undefined
        });
      });
    });

    describe('docker storage', () => {
      it('should create docker storage adapter', () => {
        const config: StorageConfig = {
          type: 'docker',
          dockerVolume: '/app/uploads',
          baseUrl: 'http://localhost:3000/uploads'
        };

        mockCreateDockerStorage.mockReturnValue(mockAdapter);

        const adapter = createStorageAdapter(config);

        expect(createDockerStorage).toHaveBeenCalledWith({
          volumePath: '/app/uploads',
          baseUrl: 'http://localhost:3000/uploads'
        });
        expect(adapter).toBe(mockAdapter);
      });

      it('should throw error if dockerVolume is missing', () => {
        const config: StorageConfig = {
          type: 'docker'
        };

        expect(() => createStorageAdapter(config)).toThrow('Docker storage requires dockerVolume in config');
      });

      it('should create docker storage without baseUrl', () => {
        const config: StorageConfig = {
          type: 'docker',
          dockerVolume: '/app/uploads'
        };

        mockCreateDockerStorage.mockReturnValue(mockAdapter);

        createStorageAdapter(config);

        expect(createDockerStorage).toHaveBeenCalledWith({
          volumePath: '/app/uploads',
          baseUrl: undefined
        });
      });
    });

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
      getUrl: jest.fn()
    };

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    describe('development environment', () => {
      it('should create local storage by default in development', () => {
        mockCreateLocalStorage.mockReturnValue(mockAdapter);

        const adapter = createStorageFromEnv('development');

        expect(createLocalStorage).toHaveBeenCalledWith({
          basePath: './public/uploads',
          baseUrl: undefined
        });
        expect(adapter).toBe(mockAdapter);
      });

      it('should use DEV_ prefixed environment variables', () => {
        process.env.DEV_STORAGE_TYPE = 'local';
        process.env.DEV_LOCAL_PATH = '/custom/dev/path';
        process.env.DEV_STORAGE_BASE_URL = 'http://dev.example.com';

        mockCreateLocalStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv('development');

        expect(createLocalStorage).toHaveBeenCalledWith({
          basePath: '/custom/dev/path',
          baseUrl: 'http://dev.example.com'
        });
      });

      it('should create docker storage in development', () => {
        process.env.DEV_STORAGE_TYPE = 'docker';
        process.env.DEV_DOCKER_VOLUME = '/app/uploads';

        mockCreateDockerStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv('development');

        expect(createDockerStorage).toHaveBeenCalledWith({
          volumePath: '/app/uploads',
          baseUrl: undefined
        });
      });

      it('should use default docker volume if not specified', () => {
        process.env.DEV_STORAGE_TYPE = 'docker';

        mockCreateDockerStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv('development');

        expect(createDockerStorage).toHaveBeenCalledWith({
          volumePath: '/app/uploads',
          baseUrl: undefined
        });
      });

      it('should create cloud storage in development', () => {
        process.env.DEV_STORAGE_TYPE = 'cloud';
        process.env.DEV_CLOUD_PROVIDER = 'aws';
        process.env.DEV_CLOUD_BUCKET = 'dev-bucket';
        process.env.DEV_CLOUD_REGION = 'us-west-1';
        process.env.DEV_CLOUD_ACCESS_KEY = 'dev-key';
        process.env.DEV_CLOUD_SECRET_KEY = 'dev-secret';

        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv('development');

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
        process.env.DEV_STORAGE_TYPE = 'cloud';
        process.env.DEV_CLOUD_BUCKET = 'dev-bucket';

        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv('development');

        expect(createCloudStorage).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: 'aws'
          })
        );
      });
    });

    describe('production environment', () => {
      it('should create cloud storage by default in production', () => {
        process.env.PROD_CLOUD_PROVIDER = 'aws';
        process.env.PROD_CLOUD_BUCKET = 'prod-bucket';

        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv('production');

        expect(createCloudStorage).toHaveBeenCalled();
      });

      it('should use PROD_ prefixed environment variables', () => {
        process.env.PROD_STORAGE_TYPE = 'cloud';
        process.env.PROD_CLOUD_PROVIDER = 'cloudflare';
        process.env.PROD_CLOUD_BUCKET = 'prod-bucket';
        process.env.PROD_CLOUD_ENDPOINT = 'https://prod.r2.cloudflarestorage.com';
        process.env.PROD_CLOUD_ACCESS_KEY = 'prod-key';
        process.env.PROD_CLOUD_SECRET_KEY = 'prod-secret';
        process.env.PROD_STORAGE_BASE_URL = 'https://cdn.example.com';

        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv('production');

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

      it('should create local storage in production if specified', () => {
        process.env.PROD_STORAGE_TYPE = 'local';
        process.env.PROD_LOCAL_PATH = '/var/www/uploads';

        mockCreateLocalStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv('production');

        expect(createLocalStorage).toHaveBeenCalledWith({
          basePath: '/var/www/uploads',
          baseUrl: undefined
        });
      });

      it('should create docker storage in production', () => {
        process.env.PROD_STORAGE_TYPE = 'docker';
        process.env.PROD_DOCKER_VOLUME = '/prod/uploads';

        mockCreateDockerStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv('production');

        expect(createDockerStorage).toHaveBeenCalledWith({
          volumePath: '/prod/uploads',
          baseUrl: undefined
        });
      });

      it('should include all cloud credentials', () => {
        process.env.PROD_STORAGE_TYPE = 'cloud';
        process.env.PROD_CLOUD_PROVIDER = 'gcp';
        process.env.PROD_CLOUD_BUCKET = 'prod-bucket';
        process.env.PROD_CLOUDFLARE_TOKEN = 'cf-token';
        process.env.PROD_CLOUD_PROJECT_ID = 'gcp-project-123';

        mockCreateCloudStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv('production');

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
        mockCreateLocalStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv();

        expect(createLocalStorage).toHaveBeenCalledWith({
          basePath: './public/uploads',
          baseUrl: undefined
        });
      });
    });

    describe('edge cases', () => {
      it('should handle missing environment variables gracefully', () => {
        mockCreateLocalStorage.mockReturnValue(mockAdapter);

        const adapter = createStorageFromEnv('development');

        expect(adapter).toBeDefined();
      });

      it('should handle empty environment variables', () => {
        process.env.DEV_STORAGE_TYPE = '';
        process.env.DEV_LOCAL_PATH = '';

        mockCreateLocalStorage.mockReturnValue(mockAdapter);

        createStorageFromEnv('development');

        expect(createLocalStorage).toHaveBeenCalled();
      });
    });
  });
});
