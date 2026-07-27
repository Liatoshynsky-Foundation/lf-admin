import { NextFunction, Request, Response } from 'express';

import { UPLOAD_ERRORS } from './errors';
import { UploadService } from './uploadService';
import { convertMulterFile, formatMultipleUploadResults, formatUploadResult, parseUploadOptions } from './utils';

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

export interface UploadControllerConfig {
  uploadService: UploadService;
}

export const createUploadController = (config: UploadControllerConfig) => {
  const { uploadService } = config;

  const uploadSingleFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = (req as RequestWithFile).file;

      if (!file) {
        res.status(400).json({ success: false, error: UPLOAD_ERRORS.NO_FILE_UPLOADED });
        return;
      }

      const uploadedFile = convertMulterFile(file);
      const options = parseUploadOptions(req.body);
      const result = await uploadService.uploadFile(uploadedFile, options);

      if (!result.success) {
        res.status(result.statusCode ?? 400).json({ success: false, errors: result.errors });
        return;
      }

      res.status(201).json({ success: true, data: formatUploadResult(result) });
    } catch (error) {
      next(error);
    }
  };

  const uploadMultipleFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = (req as RequestWithFile).files;

      if (!files || files.length === 0) {
        res.status(400).json({ success: false, error: UPLOAD_ERRORS.NO_FILES_UPLOADED });
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
      const filename = req.params.filename as string;

      if (!filename) {
        res.status(400).json({ success: false, error: UPLOAD_ERRORS.FILENAME_REQUIRED });
        return;
      }

      const buffer = await uploadService.retrieveFile(filename);

      if (!buffer) {
        res.status(404).json({ success: false, error: UPLOAD_ERRORS.FILE_NOT_FOUND });
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
      const filename = req.params.filename as string;

      if (!filename) {
        res.status(400).json({ success: false, error: UPLOAD_ERRORS.FILENAME_REQUIRED });
        return;
      }

      const deleted = await uploadService.deleteFile(filename);

      if (!deleted) {
        res.status(404).json({ success: false, error: UPLOAD_ERRORS.FILE_NOT_FOUND_OR_DELETE_FAILED });
        return;
      }

      res.json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  const getAllFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const folder = typeof req.query.folder === 'string' ? req.query.folder : undefined;
      const files = await uploadService.listFiles(folder);

      res.json({ success: true, data: files });
    } catch (error) {
      next(error);
    }
  };

  const getFileMetadata = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filename = req.params.filename as string;

      if (!filename) {
        res.status(400).json({ success: false, error: UPLOAD_ERRORS.FILENAME_REQUIRED });
        return;
      }

      const metadata = await uploadService.getFileMetadata(filename);

      if (!metadata) {
        res.status(404).json({ success: false, error: UPLOAD_ERRORS.FILE_NOT_FOUND });
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
    getAllFiles,
    getFileMetadata
  };
};

export type UploadController = ReturnType<typeof createUploadController>;
