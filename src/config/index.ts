export const mongoUrl = process.env.MONGO_URL;

export const getJWT = {
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET ?? 'your-access-secret',
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET ?? 'your-refresh-secret'
};
