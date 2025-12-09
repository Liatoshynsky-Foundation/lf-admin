import { NextFunction, Request, Response } from 'express';

import { UploadService } from './uploadService';
import { convertMulterFile, formatMultipleUploadResults, formatUploadResult, parseUploadOptions } from './utils';

export interface UploadControllerConfig {
  uploadService: UploadService;
}

export const createUploadController = (config: UploadControllerConfig) => {
  const { uploadService } = config;

  const uploadSingleFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = (req as any).file as Express.Multer.File;

      if (!file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }

      const uploadedFile = convertMulterFile(file);
      const options = parseUploadOptions(req.body);
      const result = await uploadService.uploadFile(uploadedFile, options);

      if (!result.success) {
        res.status(400).json({ success: false, errors: result.errors });
        return;
      }

      res.status(201).json({ success: true, data: formatUploadResult(result) });
    } catch (error) {
      next(error);
    }
  };

  const uploadMultipleFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = (req as any).files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ success: false, error: 'No files uploaded' });
        return;
      }

      const uploadedFiles = files.map(convertMulterFile);
      const options = parseUploadOptions(req.body);
      const results = await uploadService.uploadFiles(uploadedFiles, options);

      res.status(201).json(formatMultipleUploadResults(results));
    } catch (error) {
      next(error);
    }
  };

  const getFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filename } = req.params;

      if (!filename) {
        res.status(400).json({ success: false, error: 'Filename is required' });
        return;
      }

      const buffer = await uploadService.retrieveFile(filename);

      if (!buffer) {
        res.status(404).json({ success: false, error: 'File not found' });
        return;
      }

      const metadata = await uploadService.getFileMetadata(filename);
      if (metadata?.mimeType) {
        res.setHeader('Content-Type', metadata.mimeType);
      }

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };

  const deleteFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filename } = req.params;

      if (!filename) {
        res.status(400).json({ success: false, error: 'Filename is required' });
        return;
      }

      const deleted = await uploadService.deleteFile(filename);

      if (!deleted) {
        res.status(404).json({ success: false, error: 'File not found or could not be deleted' });
        return;
      }

      res.json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  const getFileMetadata = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filename } = req.params;

      if (!filename) {
        res.status(400).json({ success: false, error: 'Filename is required' });
        return;
      }

      const metadata = await uploadService.getFileMetadata(filename);

      if (!metadata) {
        res.status(404).json({ success: false, error: 'File not found' });
        return;
      }

      res.json({ success: true, data: metadata });
    } catch (error) {
      next(error);
    }
  };

  return {
    uploadSingleFile,
    uploadMultipleFiles,
    getFile,
    deleteFile,
    getFileMetadata
  };
};

export type UploadController = ReturnType<typeof createUploadController>;
