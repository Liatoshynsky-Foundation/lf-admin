/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { TextDecoder, TextEncoder } from 'node:util';

import {GET } from '../[filename]/route';
import { getUploadModule } from '../upload-handler';

Object.assign(globalThis, { TextDecoder, TextEncoder });

jest.mock('../upload-handler');

describe('API /api/uploads/[filename]', () => {
  const mockRetrieve = jest.fn();
  const mockDelete = jest.fn();
  const mockGetMeta = jest.fn();

  beforeAll(async () => {
    const { fetch, Request, Response, Headers, FormData } = await import('undici');
    Object.assign(globalThis, { fetch, Request, Response, Headers, FormData });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getUploadModule as jest.Mock).mockReturnValue({
      uploadService: {
        retrieveFile: mockRetrieve,
        deleteFile: mockDelete,
        getFileMetadata: mockGetMeta
      }
    });
  });

  it('should return file buffer with correct headers', async () => {
    const params = Promise.resolve({ filename: 'test.png' });
    mockRetrieve.mockResolvedValue(Buffer.from('fake-image'));
    mockGetMeta.mockResolvedValue({ mimeType: 'image/png' });

    const req = new NextRequest('https://localhost/api/uploads/test.png?folder=test');
    const res = await GET(req, { params });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
  });
});