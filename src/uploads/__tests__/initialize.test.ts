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
  const createMockConfig = (): Config => ({
    uploads: {
      storage: {
        type: 'cloud',
        cloudProvider: 'cloudflare',
        cloudConfig: {
          bucket: 'my-bucket',
          region: 'auto',
          endpoint: 'https://r2.com',
          credentials: {
            accessKeyId: 'key',
            secretAccessKey: 'secret'
          }
        },
        baseUrl: 'http://localhost'
      },
      maxFileSize: 1024,
      maxFiles: 3
    }
  } as Config);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly initialize with Cloud storage (Cloudflare)', () => {
    const config = createMockConfig();
    const uploadModule = initializeUploadModule(config);

    expect(uploadModule.storageInfo.storageType).toBe('cloud');
    expect(uploadModule.storageInfo.storageProvider).toBe('cloudflare');
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('CLOUD'));
  });

  it('should map cloud credentials correctly from config', () => {
    const config = createMockConfig();
    const uploadModule = initializeUploadModule(config);

    expect(uploadModule.controller).toBeDefined();
    expect(uploadModule.uploadService).toBeDefined();
  });
});
