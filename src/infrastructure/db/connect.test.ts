import type { Mongoose } from 'mongoose';

import { errors } from '~/constants/errors';

type MongooseGlobalCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
  listenersAttached: boolean;
  lastErrorMessage: string | null;
};

const expectedMongoConnectOptions = {
  bufferCommands: false,
  connectTimeoutMS: 60000,
  serverSelectionTimeoutMS: 60000,
  socketTimeoutMS: 60000,
  family: 4
};

const mockMongoose = (connectImpl = jest.fn()) => {
  const listeners: Record<string, (arg?: unknown) => void> = {};
  const mockConn = {
    readyState: 1,
    on: jest.fn((event: string, cb: (arg?: unknown) => void) => {
      listeners[event] = cb;
    })
  };

  jest.doMock('mongoose', () => ({
    connect: connectImpl,
    connection: mockConn
  }));

  return { mockConn, listeners };
};

const mockConfig = (url: string | undefined) => {
  jest.doMock(require.resolve('../../config'), () => ({
    mongoUrl: url
  }));
};

const mockLoggerModule = (loggerMock: { info: jest.Mock; error: jest.Mock }) => {
  jest.doMock(require.resolve('../../middleware/logger/logger'), () => loggerMock);
};

const createLoggerMock = () => ({
  info: jest.fn(),
  error: jest.fn()
});

describe('dbConnect', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    (global as { mongoose?: MongooseGlobalCache }).mongoose = undefined;
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should connect, attach listeners and cache the connection', async () => {
    const connectMock = jest.fn();
    const { mockConn, listeners } = mockMongoose(connectMock);
    connectMock.mockResolvedValue(mockConn);

    const loggerMock = createLoggerMock();
    mockConfig('mongodb://localhost:27017/test-db');
    mockLoggerModule(loggerMock);

    const { default: dbConnect, getLastMongoConnectionErrorMessage } = await import('./connect');
    const { connect } = await import('mongoose');
    const { mongoUrl } = await import('../../config');

    const conn = await dbConnect();

    expect(connect).toHaveBeenCalledWith(mongoUrl, expectedMongoConnectOptions);
    expect(loggerMock.info).toHaveBeenCalledWith('✅ Connected to db');
    expect(conn).toStrictEqual(mockConn);

    listeners.connected?.();
    expect(loggerMock.info).toHaveBeenCalledWith('✅ MongoDB connection established');
    expect(getLastMongoConnectionErrorMessage()).toBeNull();

    listeners.disconnected?.();
    expect(loggerMock.error).toHaveBeenCalledWith('❌ MongoDB connection lost');
    expect(getLastMongoConnectionErrorMessage()).toBe('MongoDB connection lost');

    listeners.error?.('Custom string error');
    expect(loggerMock.error).toHaveBeenCalledWith('❌ MongoDB connection error', 'Custom string error');
    expect(getLastMongoConnectionErrorMessage()).toBe('Custom string error');

    listeners.error?.({ unknownError: true });
    expect(getLastMongoConnectionErrorMessage()).toBeNull();
  });

  it('should reuse cached connection and skip attaching listeners if already attached', async () => {
    const connectMock = jest.fn();
    const { mockConn } = mockMongoose(connectMock);
    connectMock.mockResolvedValue(mockConn);

    const loggerMock = createLoggerMock();
    mockConfig('mongodb://localhost:27017/test-db');
    mockLoggerModule(loggerMock);

    const { default: dbConnect } = await import('./connect');

    await dbConnect();
    await dbConnect();

    expect(connectMock).toHaveBeenCalledTimes(1);
  });

  it('should log error if connection fails with string rejection', async () => {
    const errorString = 'Connection failed string error';
    const loggerMock = createLoggerMock();

    mockMongoose(jest.fn().mockRejectedValue(errorString));
    mockConfig('mongodb://localhost:27017/test-db');
    mockLoggerModule(loggerMock);

    const { default: dbConnect, getLastMongoConnectionErrorMessage } = await import('./connect');

    await expect(dbConnect()).rejects.toBe(errorString);

    expect(loggerMock.error).toHaveBeenCalledWith(errors.FAILED_TO_CONNECT_DB, errorString);
    expect(getLastMongoConnectionErrorMessage()).toBe(errorString);
  });

  it('should throw if mongoUrl is not defined', async () => {
    const loggerMock = createLoggerMock();
    mockMongoose(jest.fn());
    mockConfig(undefined);
    mockLoggerModule(loggerMock);

    const { default: dbConnect } = await import('./connect');

    await expect(dbConnect()).rejects.toThrow(errors.MISSING_MONGO_URL);
  });

  it('should reset promise if connection fails', async () => {
    const error = new Error('Connection failed');
    const loggerMock = createLoggerMock();

    mockMongoose(jest.fn().mockRejectedValue(error));
    mockConfig('mongodb://localhost:27017/test-db');
    mockLoggerModule(loggerMock);

    const { default: dbConnect } = await import('./connect');

    await expect(dbConnect()).rejects.toThrow('Connection failed');
    const cached = (global as typeof globalThis & { mongoose: MongooseGlobalCache }).mongoose;
    expect(cached.promise).toBeNull();
  });

  it('should parse environment timeouts when provided', async () => {
    process.env.MONGO_CONNECT_TIMEOUT_MS = '30000';
    process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS = '15000';
    process.env.MONGO_SOCKET_TIMEOUT_MS = '45000';

    const connectMock = jest.fn();
    const { mockConn } = mockMongoose(connectMock);
    connectMock.mockResolvedValue(mockConn);

    const loggerMock = createLoggerMock();
    mockConfig('mongodb://localhost:27017/test-db');
    mockLoggerModule(loggerMock);

    const { default: dbConnect } = await import('./connect');
    const { connect } = await import('mongoose');

    await dbConnect();

    expect(connect).toHaveBeenCalledWith('mongodb://localhost:27017/test-db', {
      bufferCommands: false,
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4
    });
  });
});
