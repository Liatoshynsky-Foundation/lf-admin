/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { TextDecoder, TextEncoder } from 'node:util';

import { GET } from '../[filename]/metadata/route';
import { getUploadModule } from '../upload-handler';

Object.assign(globalThis, { TextDecoder, TextEncoder });

jest.mock('../upload-handler');

interface UndiciWebGlobals {
  fetch: typeof fetch;
  Request: typeof Request;
  Response: typeof Response;
  Headers: typeof Headers;
}

describe('GET /api/uploads/[filename]/metadata', () => {
  const mockGetMetadata = jest.fn();

  beforeAll(async () => {
    if (globalThis.Request === undefined) {
      const undici = (await import('undici')) as unknown as UndiciWebGlobals;

      Object.assign(globalThis, {
        Request: undici.Request,
        Response: undici.Response,
        Headers: undici.Headers,
        fetch: undici.fetch
      });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getUploadModule as jest.Mock).mockReturnValue({
      uploadService: { getFileMetadata: mockGetMetadata }
    });
  });

  it('should return metadata successfully', async () => {
    const params = Promise.resolve({ filename: 'data.txt' });
    const mockMeta = {
      filename: 'data.txt',
      originalName: 'data.txt',
      mimeType: 'text/plain',
      size: 100,
      uploadedAt: new Date(),
      path: 'uploads/data.txt',
      url: 'https://localhost/uploads/data.txt'
    };

    mockGetMetadata.mockResolvedValue(mockMeta);

    const req = new NextRequest('https://localhost/api/uploads/data.txt/metadata');
    const res = await GET(req, { params });

    const json = (await res.json()) as { success: boolean; data: Record<string, unknown> };

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual(expect.objectContaining({ filename: 'data.txt' }));
  });

  it('should return 404 if file metadata is not found', async () => {
    const params = Promise.resolve({ filename: 'nonexistent.txt' });
    mockGetMetadata.mockResolvedValue(null);

    const req = new NextRequest('https://localhost/api/uploads/nonexistent.txt/metadata');
    const res = await GET(req, { params });

    expect(res.status).toBe(404);
  });
});