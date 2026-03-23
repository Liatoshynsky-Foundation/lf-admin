/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { Headers as NodeHeaders,Request as NodeRequest, Response as NodeResponse } from 'undici';

import { GET } from '../[filename]/metadata/route';
import { getUploadModule } from '../upload-handler';

if (typeof globalThis.Request === 'undefined') {
  Object.assign(globalThis, {
    Request: NodeRequest,
    Response: NodeResponse,
    Headers: NodeHeaders
  });
}

jest.mock('../upload-handler');

describe('GET /api/uploads/[filename]/metadata', () => {
  const mockGetMetadata = jest.fn();

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
      uploadedAt: new Date()
    };

    mockGetMetadata.mockResolvedValue(mockMeta);

    const req = new NextRequest('https://localhost/api/uploads/data.txt/metadata');
    const res = await GET(req, { params });
    const json = await res.json() as { success: boolean; data: unknown };

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