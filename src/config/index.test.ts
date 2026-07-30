describe('Config Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should export config with default fallback values when env vars are missing', async () => {
    const env = process.env as Record<string, string | undefined>;
    delete env.MONGO_URL;
    delete env.JWT_ACCESS_TOKEN_SECRET;
    delete env.JWT_REFRESH_TOKEN_SECRET;
    delete env.LOG_RETENTION_SECONDS;
    delete env.STORAGE_TYPE;
    delete env.CLOUD_PROVIDER;
    delete env.UPLOAD_MAX_FILE_SIZE;
    delete env.UPLOAD_MAX_FILES;

    const { config, getJWT, logRetentionSeconds, mongoUrl } = await import('./index');

    expect(mongoUrl).toBe('');
    expect(getJWT.JWT_ACCESS_TOKEN_SECRET).toBe('your-access-secret');
    expect(getJWT.JWT_REFRESH_TOKEN_SECRET).toBe('your-refresh-secret');
    expect(logRetentionSeconds).toBe(604800);

    expect(config.mongoUrl).toBe('');
    expect(config.jwt).toEqual({
      JWT_ACCESS_TOKEN_SECRET: 'your-access-secret',
      JWT_REFRESH_TOKEN_SECRET: 'your-refresh-secret'
    });
    expect(config.uploads.storage.type).toBe('cloud');
    expect(config.uploads.storage.cloudProvider).toBe('cloudflare');
    expect(config.uploads.maxFileSize).toBe(10485760);
    expect(config.uploads.maxFiles).toBe(10);
  });

  it('should parse and export custom environment values when provided', async () => {
    process.env.MONGO_URL = 'mongodb://localhost:27017/custom-db';
    process.env.JWT_ACCESS_TOKEN_SECRET = 'custom-access-secret';
    process.env.JWT_REFRESH_TOKEN_SECRET = 'custom-refresh-secret';
    process.env.LOG_RETENTION_SECONDS = '86400';
    process.env.STORAGE_TYPE = 'local';
    process.env.CLOUD_PROVIDER = 'aws';
    process.env.CLOUD_BUCKET = 'my-bucket';
    process.env.CLOUD_REGION = 'us-east-1';
    process.env.CLOUD_ENDPOINT = 'https://s3.amazonaws.com';
    process.env.CLOUD_ACCESS_KEY = 'access-key';
    process.env.CLOUD_SECRET_KEY = 'secret-key';
    process.env.CLOUD_PROJECT_ID = 'project-id';
    process.env.STORAGE_BASE_URL = 'https://cdn.example.com';
    process.env.UPLOAD_MAX_FILE_SIZE = '20971520';
    process.env.UPLOAD_MAX_FILES = '5';

    const { config, getJWT, logRetentionSeconds, mongoUrl } = await import('./index');

    expect(mongoUrl).toBe('mongodb://localhost:27017/custom-db');
    expect(getJWT.JWT_ACCESS_TOKEN_SECRET).toBe('custom-access-secret');
    expect(getJWT.JWT_REFRESH_TOKEN_SECRET).toBe('custom-refresh-secret');
    expect(logRetentionSeconds).toBe(86400);

    expect(config.mongoUrl).toBe('mongodb://localhost:27017/custom-db');
    expect(config.uploads.storage.type).toBe('local');
    expect(config.uploads.storage.cloudProvider).toBe('aws');
    expect(config.uploads.storage.cloudConfig).toEqual({
      bucket: 'my-bucket',
      region: 'us-east-1',
      endpoint: 'https://s3.amazonaws.com',
      credentials: {
        accessKeyId: 'access-key',
        secretAccessKey: 'secret-key',
        projectId: 'project-id'
      }
    });
    expect(config.uploads.storage.baseUrl).toBe('https://cdn.example.com');
    expect(config.uploads.maxFileSize).toBe(20971520);
    expect(config.uploads.maxFiles).toBe(5);
  });
});
