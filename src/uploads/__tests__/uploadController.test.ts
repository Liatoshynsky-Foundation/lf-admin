import { NextFunction,Request, Response } from 'express';

import { UPLOAD_ERRORS } from '../errors';
import { createUploadController, UploadController } from '../uploadController';
import { UploadService } from '../uploadService';

describe('UploadController', () => {
  const mockService = {
    uploadFile: jest.fn(),
    uploadFiles: jest.fn(),
    retrieveFile: jest.fn(),
    getFileMetadata: jest.fn(),
    deleteFile: jest.fn(),
    listFiles: jest.fn(),
  } as unknown as jest.Mocked<UploadService>;

  let controller: UploadController;
  let mockRes: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = createUploadController({ uploadService: mockService });

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('uploadSingleFile', () => {
    it('should return 400 if no file is present in request', async () => {
      const req = { file: undefined } as unknown as Request;

      await controller.uploadSingleFile(req, mockRes as Response, next);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: UPLOAD_ERRORS.NO_FILE_UPLOADED
      }));
    });

    it('should return 201 and data on successful upload', async () => {
      const req = {
        file: {
          originalname: 'test.jpg',
          buffer: Buffer.from('abc'),
          mimetype: 'image/jpeg',
          size: 3
        },
        body: {}
      } as unknown as Request;

      mockService.uploadFile.mockResolvedValue({
        success: true,
        filename: 'new-test.jpg',
        url: 'http://cdn.com/new-test.jpg'
      });

      await controller.uploadSingleFile(req, mockRes as Response, next);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.any(Object)
      }));
    });

    it('should propagate errors to next() middleware', async () => {
      const req = { file: { originalname: 'test.jpg' }, body: {} } as unknown as Request;
      const error = new Error('Database down');
      mockService.uploadFile.mockRejectedValue(error);

      await controller.uploadSingleFile(req, mockRes as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getFile', () => {
    it('should return 404 if file buffer is null', async () => {
      const req = { params: { filename: 'ghost.jpg' } } as unknown as Request;
      mockService.retrieveFile.mockResolvedValue(null);

      await controller.getFile(req, mockRes as Response, next);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: UPLOAD_ERRORS.FILE_NOT_FOUND
      }));
    });

    it('should set Content-Type header if metadata exists', async () => {
      const req = { params: { filename: 'test.jpg' } } as unknown as Request;
      mockService.retrieveFile.mockResolvedValue(Buffer.from('content'));
      mockService.getFileMetadata.mockResolvedValue({
        mimeType: 'image/jpeg'
      } as Record<string, unknown>);

      await controller.getFile(req, mockRes as Response, next);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(mockRes.send).toHaveBeenCalledWith(expect.any(Buffer));
    });
  });

  describe('deleteFile', () => {
    it('should return 200 on successful deletion', async () => {
      const req = { params: { filename: 'delete-me.jpg' } } as unknown as Request;
      mockService.deleteFile.mockResolvedValue(true);

      await controller.deleteFile(req, mockRes as Response, next);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'File deleted successfully'
      }));
    });
  });
});