namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    MONGO_USERNAME: string;
    MONGO_PASSWORD: string;
    MONGO_DB: string;
    MONGO_HOST: string;
    MONGO_PORT: number;
    AZURE_SAS_URL: string;
    JWT_ACCESS_TOKEN_SECRET: string;
    JWT_REFRESH_TOKEN_SECRET: string;
    CLIENT_BASE_URL: string;
  }
}
