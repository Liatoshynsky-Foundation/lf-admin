import { NextRequest } from 'next/server';

import { POST } from './route';
import { getUploadModule, parseFormDataOptions } from '~/api/uploads/upload-handler';

const mockUploadFile = jest.fn();

jest.mock('next/server', () => ({
  __esModule: true,
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => new Response(JSON.stringify(body), init)
  }
}));

jest.mock('~/api/uploads/upload-handler', () => ({
  __esModule: true,
  getUploadModule: jest.fn(),
  parseFormDataOptions: jest.fn()
}));

const buildMockRequest = (file: unknown, options: Record<string, string> = {}): NextRequest => {
  const mockFormData = {
    get: (key: string) => {
      if (key === 'file') return file;
      return options[key] ?? null;
    }
  };

  return {
    formData: jest.fn().mockResolvedValue(mockFormData)
  } as unknown as NextRequest;
};

const createMockFile = (name: string, type: string, size: number) => ({
  name,
  type,
  size,
  arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8))
});

describe('POST /api/uploads/single', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUploadModule as jest.Mock).mockReturnValue({
      uploadService: {
        uploadFile: mockUploadFile
      }
    });
  });

  it('should successfully upload a file and return 201', async () => {
    const mockFile = createMockFile('image.png', 'image/png', 1024);
    const mockOptions = { folder: 'banners' };
    const mockResult = { success: true, url: 'https://storage/image.png' };

    (parseFormDataOptions as jest.Mock).mockReturnValue(mockOptions);
    mockUploadFile.mockResolvedValue(mockResult);

    const req = buildMockRequest(mockFile);
    const res = await POST(req);

    expect(res.status).toBe(201);

    const json = (await res.json()) as { success: boolean; data: typeof mockResult };

    expect(json.success).toBe(true);
    expect(json.data).toEqual(mockResult);
    expect(mockUploadFile).toHaveBeenCalledWith(
      expect.objectContaining({
        originalname: 'image.png',
        mimetype: 'image/png',
        size: 1024
      }),
      mockOptions
    );
  });

  it('should return 400 when no file is uploaded', async () => {
    const req = buildMockRequest(null);
    const res = await POST(req);

    expect(res.status).toBe(400);

    const json = (await res.json()) as { success: boolean; error: string };

    expect(json.success).toBe(false);
    expect(json.error).toBe('No file uploaded');
    expect(mockUploadFile).not.toHaveBeenCalled();
  });

  it('should return 400 with errors when uploadFile fails', async () => {
    const mockFile = createMockFile('invalid.txt', 'text/plain', 500);
    const mockErrors = ['File format is not allowed'];
    const mockResult = { success: false, errors: mockErrors };

    mockUploadFile.mockResolvedValue(mockResult);

    const req = buildMockRequest(mockFile);
    const res = await POST(req);

    expect(res.status).toBe(400);

    const json = (await res.json()) as { success: boolean; errors: string[] };

    expect(json.success).toBe(false);
    expect(json.errors).toEqual(mockErrors);
  });

  it('should return 500 when exception is thrown', async () => {
    const req = {
      formData: jest.fn().mockRejectedValue(new Error('Form data parsing failed'))
    } as unknown as NextRequest;

    const res = await POST(req);

    expect(res.status).toBe(500);

    const json = (await res.json()) as { success: boolean; error: string };

    expect(json.success).toBe(false);
    expect(json.error).toBe('Internal server error');
  });
});
