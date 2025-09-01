export interface UploadBlobArgs {
  folderName: string;
  blobName: string;
  buffer: string;
  contentType?: string;
}

export interface DeleteBlobArgs {
  folderName: string;
  blobName: string;
}
