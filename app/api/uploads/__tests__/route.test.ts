/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { TextDecoder, TextEncoder } from 'node:util';

import { GET } from '../route';
import { getUploadModule } from '../upload-handler';

Object.assign(globalThis, { TextDecoder, TextEncoder });

jest.mock('../upload-handler');

interface UndiciWebGlobals {
  fetch: typeof fetch;
  Request: typeof Request;
  Response: typeof Response;
  Headers: typeof Headers;
}

describe('GET /api/uploads', () => {
  const mockListFiles = jest.fn();

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
      uploadService: {
        listFiles: mockListFiles
      }
    });
  });

  it('should return a list of files and return 200', async () => {
    const mockFiles = [{ filename: '1.png' }, { filename: '2.png' }];
    mockListFiles.mockResolvedValue(mockFiles);

    const req = new NextRequest('https://localhost/api/uploads?folder=images');
    const res = await GET(req);

    expect(res.status).toBe(200);

    const json = (await res.json()) as { success: boolean; data: Record<string, unknown>[] };

    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(2);
    expect(mockListFiles).toHaveBeenCalledWith('images');
  });

  it('should return 500 when listFiles throws an error', async () => {
    mockListFiles.mockRejectedValue(new Error('List files failed'));

    const req = new NextRequest('https://localhost/api/uploads');
    const res = await GET(req);

    expect(res.status).toBe(500);

    const json = (await res.json()) as { success: boolean; error: string };

    expect(json.success).toBe(false);
    expect(json.error).toBe('Failed to list files');
  });
});
