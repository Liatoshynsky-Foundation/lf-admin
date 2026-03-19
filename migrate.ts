import 'dotenv/config';

const isAtlas = process.env.MONGO_HOST?.includes('mongodb.net');

const mongoUri = isAtlas
  ? `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  : `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT ?? 27017}/${process.env.MONGO_DB}`;

export default {
  uri: mongoUri,
  collection: 'migrations',
  migrationsPath: './migrations',
  templatePath: './migrations/template.ts',
  autosync: false
};
