import { NextFunction,Request, Response } from 'express';

import { UPLOAD_ERRORS } from '../../errors';
import { createUploadController, UploadController } from '../../uploadController';

describe('UploadController', () => {
  let mockUploadService: jest.Mocked<Record<string, jest.Mock>>;
  let controller: UploadController;
  let req: Partial<Request> & { file?: unknown; files?: unknown[] };
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockUploadService = {
      uploadFile: jest.fn(),
      uploadFiles: jest.fn(),
      retrieveFile: jest.fn(),
      getFileMetadata: jest.fn(),
      deleteFile: jest.fn(),
      listFiles: jest.fn()
    };

    controller = createUploadController({ uploadService: mockUploadService as unknown as never });

    req = {
      body: {},
      params: {},
      query: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  describe('uploadSingleFile', () => {
    it('returns 400 when no file is uploaded', async () => {
      req.file = undefined;
      await controller.uploadSingleFile(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: UPLOAD_ERRORS.NO_FILE_UPLOADED });
    });

    it('returns 400 when service returns failure results', async () => {
      req.file = { originalname: 'test.jpg', buffer: Buffer.from('') } as unknown as never;
      mockUploadService.uploadFile.mockResolvedValueOnce({ success: false, errors: ['Invalid image'] });

      await controller.uploadSingleFile(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, errors: ['Invalid image'] });
    });

    it('returns 201 on successful upload format mapping', async () => {
      req.file = { originalname: 'test.jpg', buffer: Buffer.from('') } as unknown as never;
      mockUploadService.uploadFile.mockResolvedValueOnce({ success: true, url: 'http://test.url' });

      await controller.uploadSingleFile(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('passes runtime validation exceptions into next error handlers', async () => {
      req.file = { originalname: 'test.jpg', buffer: Buffer.from('') } as unknown as never;
      const runtimeError = new Error('Fatal filesystem database failure');
      mockUploadService.uploadFile.mockRejectedValueOnce(runtimeError);

      await controller.uploadSingleFile(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(runtimeError);
    });
  });

  describe('uploadMultipleFiles', () => {
    it('returns 400 when files array is empty or missing', async () => {
      req.files = [];
      await controller.uploadMultipleFiles(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 201 and dispatches grouped files to service layouts', async () => {
      req.files = [{ originalname: '1.png', buffer: Buffer.from('') } as unknown as never];
      mockUploadService.uploadFiles.mockResolvedValueOnce([]);

      await controller.uploadMultipleFiles(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('handles query level rejections within multiple file uploads gracefully', async () => {
      req.files = [{ originalname: '1.png', buffer: Buffer.from('') } as unknown as never];
      const err = new Error('Rejection');
      mockUploadService.uploadFiles.mockRejectedValueOnce(err);

      await controller.uploadMultipleFiles(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('getFile', () => {
    it('returns 400 when filename param is completely omitted', async () => {
      req.params = { filename: '' };
      await controller.getFile(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when data stream buffers are completely missing', async () => {
      req.params = { filename: 'miss.jpg' };
      mockUploadService.retrieveFile.mockResolvedValueOnce(null);

      await controller.getFile(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('sets response header metadata and fires file buffer payload data transparently', async () => {
      req.params = { filename: 'exist.jpg' };
      const fakeBuffer = Buffer.from('payload');
      mockUploadService.retrieveFile.mockResolvedValueOnce(fakeBuffer);
      mockUploadService.getFileMetadata.mockResolvedValueOnce({ mimeType: 'image/jpeg' });

      await controller.getFile(req as Request, res as Response, next);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(res.send).toHaveBeenCalledWith(fakeBuffer);
    });

    it('skips content-type registration if metadata payloads lack mime configurations', async () => {
      req.params = { filename: 'exist.jpg' };
      mockUploadService.retrieveFile.mockResolvedValueOnce(Buffer.from('payload'));
      mockUploadService.getFileMetadata.mockResolvedValueOnce(null);

      await controller.getFile(req as Request, res as Response, next);
      expect(res.setHeader).not.toHaveBeenCalled();
    });

    it('intercepts query routing crashes inside next middleware loops', async () => {
      req.params = { filename: 'crash.jpg' };
      const fatalErr = new Error('Disk error');
      mockUploadService.retrieveFile.mockRejectedValueOnce(fatalErr);

      await controller.getFile(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(fatalErr);
    });
  });

  describe('deleteFile', () => {
    it('returns 400 if filename is missing on destruction routing requests', async () => {
      req.params = { filename: '' };
      await controller.deleteFile(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 if deletion status operations fail inside services', async () => {
      req.params = { filename: 'ghost.jpg' };
      mockUploadService.deleteFile.mockResolvedValueOnce(false);

      await controller.deleteFile(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 200 data success messages on structural delete operations', async () => {
      req.params = { filename: 'kill.jpg' };
      mockUploadService.deleteFile.mockResolvedValueOnce(true);

      await controller.deleteFile(req as Request, res as Response, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('redirects fatal deletion file issues cleanly downstream via next triggers', async () => {
      req.params = { filename: 'error.jpg' };
      const deleteError = new Error('Locked file system paths');
      mockUploadService.deleteFile.mockRejectedValueOnce(deleteError);

      await controller.deleteFile(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(deleteError);
    });
  });

  describe('getAllFiles', () => {
    it('handles query level folder bindings if params are standard string formats', async () => {
      req.query = { folder: 'photos' };
      mockUploadService.listFiles.mockResolvedValueOnce([]);

      await controller.getAllFiles(req as Request, res as Response, next);
      expect(mockUploadService.listFiles).toHaveBeenCalledWith('photos');
    });

    it('passes generic error scenarios cleanly downstream inside next catch pipelines', async () => {
      const genericErr = new Error('Database disconnected layout state');
      mockUploadService.listFiles.mockRejectedValueOnce(genericErr);

      await controller.getAllFiles(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(genericErr);
    });
  });

  describe('getFileMetadata', () => {
    it('returns 400 if filename is omitted on specific configuration inquiries', async () => {
      req.params = { filename: '' };
      await controller.getFileMetadata(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 if target metadata schemas return empty results', async () => {
      req.params = { filename: 'unknown.jpg' };
      mockUploadService.getFileMetadata.mockResolvedValueOnce(null);

      await controller.getFileMetadata(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 200 data objects on successful asset metadata mapping requests', async () => {
      req.params = { filename: 'valid.jpg' };
      const meta = { sizeBytes: 100, type: 'pdf' };
      mockUploadService.getFileMetadata.mockResolvedValueOnce(meta);

      await controller.getFileMetadata(req as Request, res as Response, next);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: meta });
    });

    it('funnels metadata exceptions flawlessly into next callback streams', async () => {
      req.params = { filename: 'crash.jpg' };
      const fatalMetadataErr = new Error('Corruption');
      mockUploadService.getFileMetadata.mockRejectedValueOnce(fatalMetadataErr);

      await controller.getFileMetadata(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(fatalMetadataErr);
    });
  });
});
