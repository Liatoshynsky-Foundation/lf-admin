export interface FileMetadata {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  path: string;
  url?: string;
  directory?: string;
}

export interface FilesResponse {
  success: boolean;
  data: FileMetadata[];
  error?: string;
}
