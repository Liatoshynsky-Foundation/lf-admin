export const mongoUrl = process.env.MONGO_URL ?? '';

export const getJWT = {
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET ?? 'your-access-secret',
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET ?? 'your-refresh-secret'
};

// Uploads Module Configuration
export interface UploadConfig {
  storageType: 'local' | 'docker' | 'cloud';
  localPath?: string;
  dockerVolume?: string;
  cloudProvider?: 'aws' | 'gcp' | 'azure' | 'cloudflare';
  cloudConfig?: {
    bucket?: string;
    region?: string;
    endpoint?: string;
    accessKey?: string;
    secretKey?: string;
    projectId?: string;
  };
  baseUrl?: string;
  cloudBaseUrl?: string;
  maxFileSize: number;
  maxFiles: number;
}

export interface Config {
  mongoUrl: string;
  jwt: typeof getJWT;
  uploads: UploadConfig;
}

const uploadsConfig: UploadConfig = {
  storageType: (process.env.UPLOAD_STORAGE_TYPE as 'local' | 'docker' | 'cloud') || 'local',
  localPath: process.env.UPLOAD_LOCAL_PATH || './public/uploads',
  dockerVolume: process.env.UPLOAD_DOCKER_VOLUME,
  cloudProvider: process.env.UPLOAD_CLOUD_PROVIDER as 'aws' | 'gcp' | 'azure' | 'cloudflare',
  cloudConfig: {
    bucket: process.env.UPLOAD_CLOUD_BUCKET,
    region: process.env.UPLOAD_CLOUD_REGION,
    endpoint: process.env.UPLOAD_CLOUD_ENDPOINT,
    accessKey: process.env.UPLOAD_CLOUD_ACCESS_KEY,
    secretKey: process.env.UPLOAD_CLOUD_SECRET_KEY,
    projectId: process.env.UPLOAD_CLOUD_PROJECT_ID
  },
  baseUrl: process.env.UPLOAD_BASE_URL || 'http://localhost:3000/uploads',
  cloudBaseUrl: process.env.UPLOAD_CLOUD_BASE_URL,
  maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '10485760', 10), // 10MB default
  maxFiles: parseInt(process.env.UPLOAD_MAX_FILES || '10', 10)
};

export const config: Config = {
  mongoUrl,
  jwt: getJWT,
  uploads: uploadsConfig
};
