import { NextRequest } from 'next/server';

import { DELETE,GET } from './route';

const mockUploadService = {
  retrieveFile: jest.fn(),
  getFileMetadata: jest.fn(),
  deleteFile: jest.fn()
};

jest.mock('../upload-handler', () => ({
  getUploadModule: jest.fn(() => ({ uploadService: mockUploadService }))
}));

describe('app/api/uploads/[filename]/route', () => {
  const filename = 'test.png';
  const params = Promise.resolve({ filename });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns 400 if folder parameter is missing', async () => {
      const req = new NextRequest('http://localhost/api/uploads/test.png');
      const response = await GET(req, { params });

      expect(response.status).toBe(400);
    });

    it('returns 404 if file is not found', async () => {
      mockUploadService.retrieveFile.mockResolvedValue(null);
      const req = new NextRequest('http://localhost/api/uploads/test.png?folder=public');

      const response = await GET(req, { params });

      expect(response.status).toBe(404);
    });

    it('returns 200 and file data with mimeType', async () => {
      const buffer = Buffer.from('fake-file-content');
      mockUploadService.retrieveFile.mockResolvedValue(buffer);
      mockUploadService.getFileMetadata.mockResolvedValue({ mimeType: 'image/png' });

      const req = new NextRequest('http://localhost/api/uploads/test.png?folder=public');
      const response = await GET(req, { params });

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/png');
    });

    it('returns 200 and falls back to octet-stream', async () => {
      const buffer = Buffer.from('fake-file-content');
      mockUploadService.retrieveFile.mockResolvedValue(buffer);
      mockUploadService.getFileMetadata.mockResolvedValue({ mimeType: null });

      const req = new NextRequest('http://localhost/api/uploads/test.png?folder=public');
      const response = await GET(req, { params });

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/octet-stream');
    });

    it('returns 500 if internal error occurs', async () => {
      mockUploadService.retrieveFile.mockRejectedValue(new Error('DB Fail'));
      const req = new NextRequest('http://localhost/api/uploads/test.png?folder=public');

      const response = await GET(req, { params });

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE', () => {
    it('returns 200 and calls deleteFile with correct folder', async () => {
      mockUploadService.deleteFile.mockResolvedValue(true);
      const req = new NextRequest('http://localhost/api/uploads/test.png?folder=public');

      const response = await DELETE(req, { params });

      expect(response.status).toBe(200);
      expect(mockUploadService.deleteFile).toHaveBeenCalledWith(filename, 'public');
    });

    it('returns 200 when folder is missing', async () => {
      mockUploadService.deleteFile.mockResolvedValue(true);
      const req = new NextRequest('http://localhost/api/uploads/test.png');

      const response = await DELETE(req, { params });

      expect(response.status).toBe(200);
      expect(mockUploadService.deleteFile).toHaveBeenCalledWith(filename, undefined);
    });

    it('returns 400 when deleteFile returns false', async () => {
      mockUploadService.deleteFile.mockResolvedValue(false);
      const req = new NextRequest('http://localhost/api/uploads/test.png?folder=public');

      const response = await DELETE(req, { params });

      expect(response.status).toBe(400);
    });

    it('returns 500 when deleteFile throws an exception', async () => {
      mockUploadService.deleteFile.mockRejectedValue(new Error('Unexpected error'));
      const req = new NextRequest('http://localhost/api/uploads/test.png?folder=public');

      const response = await DELETE(req, { params });

      expect(response.status).toBe(500);
    });
  });
});
