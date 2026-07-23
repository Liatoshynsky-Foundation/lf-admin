/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { TextDecoder, TextEncoder } from 'node:util';

import { POST } from '../single/route';
import { getUploadModule } from '../upload-handler';

Object.assign(globalThis, { TextDecoder, TextEncoder });

jest.mock('../upload-handler');

jest.mock(
  'winston-mongodb',
  () => ({
    MongoDB: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      log: jest.fn()
    }))
  }),
  { virtual: true }
);

interface UndiciWebGlobals {
  fetch: typeof fetch;
  Request: typeof Request;
  Response: typeof Response;
  Headers: typeof Headers;
  FormData: typeof FormData;
  Blob: typeof Blob;
}

describe('POST /api/uploads/single', () => {
  const mockUploadFile = jest.fn();

  beforeAll(async () => {
    if (globalThis.FormData === undefined || globalThis.Blob === undefined) {
      const undici = (await import('undici')) as unknown as UndiciWebGlobals;

      Object.assign(globalThis, {
        fetch: undici.fetch,
        Request: undici.Request,
        Response: undici.Response,
        Headers: undici.Headers,
        FormData: undici.FormData,
        Blob: undici.Blob
      });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getUploadModule as jest.Mock).mockReturnValue({
      uploadService: { uploadFile: mockUploadFile }
    });
  });

  it('should return 201 on successful upload', async () => {
    const formData = new FormData();
    const content = Buffer.from('test content');
    const blob = new Blob([content], { type: 'image/png' });

    formData.append('file', blob, 'test.png');

    mockUploadFile.mockResolvedValue({
      success: true,
      filename: 'generated.png',
      url: 'https://cdn.com/generated.png',
      metadata: { originalName: 'test.png' }
    });

    const req = new NextRequest('https://localhost/api/uploads/single', {
      method: 'POST',
      body: formData as unknown as ReadableStream
    });

    const res = await POST(req);

    expect(res.status).toBe(201);
    const data = (await res.json()) as { success: boolean };
    expect(data.success).toBe(true);
  });

  it('should return 400 if no file is provided', async () => {
    const formData = new FormData();
    const req = new NextRequest('https://localhost/api/uploads/single', {
      method: 'POST',
      body: formData as unknown as ReadableStream
    });

    const res = await POST(req);
    const data = (await res.json()) as { error: string };

    expect(res.status).toBe(400);
    expect(data.error).toBe('No file uploaded');
  });

  it('should return service status code when upload fails', async () => {
    const formData = new FormData();
    const content = Buffer.from('test content');
    const blob = new Blob([content], { type: 'image/png' });

    formData.append('file', blob, 'test.png');

    mockUploadFile.mockResolvedValue({
      success: false,
      errors: ['Файл test.png вже існує'],
      statusCode: 409
    });

    const req = new NextRequest('https://localhost/api/uploads/single', {
      method: 'POST',
      body: formData as unknown as ReadableStream
    });

    const res = await POST(req);
    const data = (await res.json()) as { success: boolean; errors: string[] };

    expect(res.status).toBe(409);
    expect(data).toEqual({
      success: false,
      errors: ['Файл test.png вже існує']
    });
  });

  it('should return 400 when upload fails without a service status code', async () => {
    const formData = new FormData();
    const content = Buffer.from('test content');
    const blob = new Blob([content], { type: 'image/png' });

    formData.append('file', blob, 'test.png');

    mockUploadFile.mockResolvedValue({
      success: false,
      errors: ['Invalid image']
    });

    const req = new NextRequest('https://localhost/api/uploads/single', {
      method: 'POST',
      body: formData as unknown as ReadableStream
    });

    const res = await POST(req);
    const data = (await res.json()) as { success: boolean; errors: string[] };

    expect(res.status).toBe(400);
    expect(data).toEqual({
      success: false,
      errors: ['Invalid image']
    });
  });

  it('should return 500 when request parsing fails', async () => {
    const req = {
      formData: jest.fn().mockRejectedValue(new Error('form data failed'))
    } as unknown as NextRequest;

    const res = await POST(req);
    const data = (await res.json()) as { success: boolean; error: string };

    expect(res.status).toBe(500);
    expect(data).toEqual({ success: false, error: 'Internal server error' });
  });
});
