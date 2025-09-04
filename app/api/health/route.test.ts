import 'whatwg-fetch';
import mongoose from 'mongoose';

import { GET } from './route';
import { errors } from '~/constants/errors';
import dbConnect from '~/infrastructure/db/connect';

jest.mock('mongoose', () => {
  const mockDbCommand = jest.fn();
  const mockServerStatus = jest.fn();
  const mockAdmin = jest.fn(() => ({
    serverStatus: mockServerStatus
  }));

  return {
    __esModule: true,
    default: {
      connection: {
        readyState: 0,
        db: {
          command: mockDbCommand,
          admin: mockAdmin
        },
        host: 'mock-host',
        port: 27017,
        name: 'mock-db-name'
      }
    }
  };
});

jest.mock('next/server', () => ({
  __esModule: true,
  NextResponse: {
    json: (body: any, init?: ResponseInit) => new Response(JSON.stringify(body), init)
  }
}));
jest.mock('~/utils/apiResponse', () => ({
  successResponse: jest.fn((data) => new Response(JSON.stringify(data), { status: 200 }))
}));
jest.mock('~/src/infrastructure/db/connect', () => ({
  __esModule: true,
  default: jest.fn()
}));

const mockDbCommand = mongoose.connection.db!.command as jest.Mock;
const mockServerStatus = mongoose.connection.db!.admin().serverStatus as jest.Mock;

describe('GET /api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mongoose.connection as any).readyState = 0;
  });

  it('should return status UP when database connection is successful', async () => {
    (dbConnect as jest.Mock).mockResolvedValue(true);
    (mongoose.connection as any).readyState = 1;

    mockDbCommand.mockResolvedValue({ collections: 10, objects: 1000 });
    mockServerStatus.mockResolvedValue({ version: '5.0.0', uptime: 3600 });

    const response = await GET();

    expect(response.status).toBe(200);
    const responseJson = await response.json();
    expect(responseJson.status).toBe('UP');
    expect(responseJson.dependencies.database.status).toBe('UP');
    expect(responseJson.dependencies.database.details).toEqual(
      expect.objectContaining({ connectionStatus: 'CONNECTED' })
    );
  });

  it('should return status DOWN with 503 if database is not connected', async () => {
    (dbConnect as jest.Mock).mockResolvedValue(true);
    (mongoose.connection as any).readyState = 2;

    const response = await GET();

    expect(response.status).toBe(503);
    const responseJson = await response.json();
    expect(responseJson.status).toBe('DOWN');
    expect(responseJson.dependencies.database.message).toBe('Database connection state is: CONNECTING');
    expect(mockDbCommand).not.toHaveBeenCalled();
  });

  it('should return status DOWN with 503 if dbConnect throws an error', async () => {
    const mockError = new Error('Connection failed');
    (dbConnect as jest.Mock).mockRejectedValue(mockError);

    const response = await GET();

    expect(response.status).toBe(503);
    const responseJson = await response.json();
    expect(responseJson.dependencies.database.message).toBe(errors.FAILED_TO_CONNECT_DB);
  });

  it('should return status DOWN with 503 if db.command throws an error', async () => {
    (dbConnect as jest.Mock).mockResolvedValue(true);
    (mongoose.connection as any).readyState = 1;
    const mockError = new Error('Command failed');
    mockDbCommand.mockRejectedValue(mockError);

    const response = await GET();

    expect(response.status).toBe(503);
    const responseJson = await response.json();
    expect(responseJson.dependencies.database.message).toBe(errors.FAILED_TO_CONNECT_DB);
  });
});
