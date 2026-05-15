import mongoose from 'mongoose';

import { mongoUrl } from '../../config';
import { errors } from '~/constants/errors';
import logger from '~/middleware/logger/logger';

type MongooseGlobalCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  listenersAttached: boolean;
  lastErrorMessage: string | null;
};

const toErrorMessage = (error: unknown): string | null => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return typeof error === 'string' && error.length > 0 ? error : null;
};

const getEnvNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const mongoConnectTimeoutMs = getEnvNumber(process.env.MONGO_CONNECT_TIMEOUT_MS, 60000);
const mongoServerSelectionTimeoutMs = getEnvNumber(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS, 60000);
const mongoSocketTimeoutMs = getEnvNumber(process.env.MONGO_SOCKET_TIMEOUT_MS, 60000);

const mongoConnectOptions = {
  bufferCommands: false,
  connectTimeoutMS: mongoConnectTimeoutMs,
  serverSelectionTimeoutMS: mongoServerSelectionTimeoutMs,
  socketTimeoutMS: mongoSocketTimeoutMs,
  family: 4 as const
};

const cached: MongooseGlobalCache = (global as { mongoose?: MongooseGlobalCache }).mongoose ?? {
  conn: null,
  promise: null,
  listenersAttached: false,
  lastErrorMessage: null
};
(global as { mongoose?: MongooseGlobalCache }).mongoose = cached;

const attachConnectionListeners = () => {
  if (cached.listenersAttached || typeof mongoose.connection?.on !== 'function') {
    return;
  }

  mongoose.connection.on('connected', () => {
    cached.lastErrorMessage = null;
    logger.info('✅ MongoDB connection established');
  });

  mongoose.connection.on('disconnected', () => {
    cached.lastErrorMessage = 'MongoDB connection lost';
    logger.error('❌ MongoDB connection lost');
  });

  mongoose.connection.on('error', (error) => {
    cached.lastErrorMessage = toErrorMessage(error);
    logger.error('❌ MongoDB connection error', error);
  });

  cached.listenersAttached = true;
};

async function dbConnect() {
  if (!mongoUrl) {
    throw new Error(errors.MISSING_MONGO_URL);
  }

  attachConnectionListeners();

  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUrl, mongoConnectOptions).then((mongoose) => {
      logger.info('✅ Connected to db');
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
    cached.lastErrorMessage = null;
  } catch (error) {
    cached.promise = null;
    cached.lastErrorMessage = toErrorMessage(error);
    logger.error(errors.FAILED_TO_CONNECT_DB, error);
    throw error;
  }

  return cached.conn;
}

export const getLastMongoConnectionErrorMessage = () => cached.lastErrorMessage;

export default dbConnect;
