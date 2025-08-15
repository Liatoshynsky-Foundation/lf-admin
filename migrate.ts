import 'dotenv/config';

const mongoUri =
  process.env.NODE_ENV === 'production'
    ? `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}`
    : `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT ?? 27017}/${process.env.MONGO_DB}`;

export default {
  uri: mongoUri,
  collection: 'migrations',
  migrationsPath: './migrations',
  templatePath: './migrations/template.ts',
  autosync: false
};
