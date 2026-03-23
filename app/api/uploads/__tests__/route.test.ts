/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { Request as NodeRequest } from 'undici';

import { GET } from '../route';
import { getUploadModule } from '../upload-handler';

jest.mock('../upload-handler');

describe('GET /api/uploads', () => {
  beforeAll(() => {
    if (typeof globalThis.Request === 'undefined') {
      globalThis.Request = NodeRequest as unknown as typeof Request;
    }
  });

  it('should return a list of files and return 200', async () => {
    const mockFiles = [{ filename: '1.png' }, { filename: '2.png' }];

    (getUploadModule as jest.Mock).mockReturnValue({
      uploadService: {
        listFiles: jest.fn().mockResolvedValue(mockFiles)
      }
    });

    const req = new NextRequest('https://localhost/api/uploads?folder=images');
    const res = await GET(req);

    expect(res.status).toBe(200);

    const json = await res.json() as { success: boolean; data: unknown[] };
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(2);
  });
});