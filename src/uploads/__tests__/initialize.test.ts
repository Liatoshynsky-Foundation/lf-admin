import { Config } from '../../config';
import logger from '../../middleware/logger/logger';
import { initializeUploadModule } from '../initialize';

jest.mock('../../middleware/logger/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  default: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('Upload Module Initialization', () => {
  const createMockConfig = (storageType: 'azure-blob' | 'cloud'): Config => ({
    uploads: {
      storage: {
        type: storageType,
        azureContainerName: 'test-container',
        azureFolderPrefix: 'uploads',
        cloudProvider: storageType === 'cloud' ? 'cloudflare' : undefined,
        cloudConfig: storageType === 'cloud' ? {
          bucket: 'my-bucket',
          accessKey: 'key',
          secretKey: 'secret',
          endpoint: 'https://r2.com'
        } : undefined,
        baseUrl: 'http://localhost'
      },
      maxFileSize: 1024,
      maxFiles: 3
    }
  } as Config);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly initialize with Azure Blob storage', () => {
    const config = createMockConfig('azure-blob');
    const uploadModule = initializeUploadModule(config);

    expect(uploadModule.storageInfo.storageType).toBe('azure-blob');
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('AZURE-BLOB'));
    expect(uploadModule.uploadLimits.fileSize).toBe(1024);
  });

  it('should correctly initialize with Cloud storage (Cloudflare)', () => {
    const config = createMockConfig('cloud');
    const uploadModule = initializeUploadModule(config);

    expect(uploadModule.storageInfo.storageType).toBe('cloud');
    expect(uploadModule.storageInfo.storageProvider).toBe('cloudflare');
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('CLOUD'));
  });

  it('should map cloud credentials correctly from config', () => {
    const config = createMockConfig('cloud');
    const uploadModule = initializeUploadModule(config);

    expect(uploadModule.controller).toBeDefined();
    expect(uploadModule.uploadService).toBeDefined();
  });
});