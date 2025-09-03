import 'whatwg-fetch';

import { GET } from './route';
import { errors } from '~/constants/errors';
import { validateWithZod } from '~/utils/validateRequestData';

jest.mock('next/server', () => ({
  __esModule: true,
  NextResponse: {
    json: (body: any, init: ResponseInit) => new Response(JSON.stringify(body), init)
  }
}));

const mockUploadService = {
  constructBlobUrl: jest.fn(),
  streamBlob: jest.fn()
};

jest.mock('~/src/middleware/logger/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn()
  }
}));

jest.mock('~/src/container/index', () => ({
  createRequestContainer: jest.fn(() => ({
    resolve: jest.fn().mockReturnValue(mockUploadService)
  }))
}));

jest.mock('~/utils/validateRequestData', () => ({
  validateWithZod: jest.fn()
}));

const mockValidateWithZod = validateWithZod as jest.Mock;
const { constructBlobUrl: mockConstructBlobUrl, streamBlob: mockStreamBlob } = mockUploadService;

describe('GET /api/blob-url', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if validation fails', async () => {
    const validationErrors = [{ field: 'blobName', message: 'Invalid blobName' }];
    mockValidateWithZod.mockReturnValue({
      valid: false,
      errors: validationErrors
    });

    const request = new Request('http://localhost/api/blob-url?blobName=&folderName=test');
    const response = await GET(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ success: false, errors: validationErrors });
    expect(mockValidateWithZod).toHaveBeenCalledTimes(1);
    expect(mockConstructBlobUrl).not.toHaveBeenCalled();
  });

  it('should return a streamed blob if validation passes and service call is successful', async () => {
    const mockBlobUrl = 'http://mock.blob.url/test-folder/test-blob';
    const mockStreamResponse = new Response('mock-blob-data', { status: 200 });

    mockValidateWithZod.mockReturnValue({
      valid: true,
      value: { blobName: 'test-blob', folderName: 'test-folder' }
    });
    mockConstructBlobUrl.mockReturnValue(mockBlobUrl);
    mockStreamBlob.mockResolvedValue(mockStreamResponse);

    const request = new Request('http://localhost/api/blob-url?blobName=test-blob&folderName=test-folder');
    request.headers.set('range', 'bytes=0-100');

    const response = await GET(request);

    expect(response).toEqual(mockStreamResponse);
    expect(await response.text()).toBe('mock-blob-data');
    expect(mockConstructBlobUrl).toHaveBeenCalledWith('test-folder', 'test-blob');
    expect(mockStreamBlob).toHaveBeenCalledWith(mockBlobUrl, 'bytes=0-100');
  });

  it('should return 503 and log error if uploadService fails', async () => {
    const mockError = new Error('Service connection failed');
    mockValidateWithZod.mockReturnValue({
      valid: true,
      value: { blobName: 'test-blob', folderName: 'test-folder' }
    });
    mockConstructBlobUrl.mockImplementation(() => {
      throw mockError;
    });

    const request = new Request('http://localhost/api/blob-url?blobName=test-blob&folderName=test-folder');
    const response = await GET(request);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ success: false, errors: [errors.AZURE_URL_NOT_DEFINED] });
  });

  it('should pass no range header if not present in request', async () => {
    const mockBlobUrl = 'http://mock.blob.url/test-folder/test-blob';
    const mockStreamResponse = new Response('mock-blob-data', { status: 200 });

    mockValidateWithZod.mockReturnValue({
      valid: true,
      value: { blobName: 'test-blob', folderName: 'test-folder' }
    });
    mockConstructBlobUrl.mockReturnValue(mockBlobUrl);
    mockStreamBlob.mockResolvedValue(mockStreamResponse);

    const request = new Request('http://localhost/api/blob-url?blobName=test-blob&folderName=test-folder');
    const response = await GET(request);

    expect(response).toEqual(mockStreamResponse);
    expect(mockStreamBlob).toHaveBeenCalledWith(mockBlobUrl, null);
  });
});
