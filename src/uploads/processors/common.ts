export interface ProcessingResult {
  success: boolean;
  buffer: Buffer;
  metadata: Record<string, any>;
  errors: string[];
}

export interface FileProcessor {
  process: (
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options?: Record<string, any>
  ) => Promise<ProcessingResult>;
}

export const createIdentityProcessor = (): FileProcessor => {
  const process = async (
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options: Record<string, any> = {}
  ): Promise<ProcessingResult> => {
    return {
      success: true,
      buffer,
      metadata: {
        originalFilename: filename,
        originalMimeType: mimeType,
        processed: false,
        ...options
      },
      errors: []
    };
  };

  return { process };
};
