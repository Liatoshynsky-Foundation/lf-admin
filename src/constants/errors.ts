export const errors = {
  REFRESH_TOKEN_REVOKED: 'Refresh token has been revoked',
  EXPIRED_ACCESS_TOKEN: 'You must be logged in to access this resource',
  FAILED_TO_UPLOAD_BLOB: 'Error during upload blob file',
  FAILED_TO_DELETE_BLOB: 'Error during delete blob file',
  FAILED_TO_GET_BLOB: 'Error during get blob file',
  BLOB_DOES_NOT_EXIST: 'Blob with this name does not exist',
  AZURE_URL_NOT_DEFINED: 'AZURE_SAS_URL environment variable is not defined'
};

export const newsServiceErrors = {
  SLUG_ALREADY_EXISTS: (slug: string) => `News with slug "${slug}" already exists`,
  NEWS_NOT_FOUND: (id: string) => `News with id "${id}" not found`,
  FAILED_TO_PUBLISH: (id: string) => `Failed to publish news with id "${id}"`,
  FAILED_TO_UNPUBLISH: (id: string) => `Failed to unpublish news with id "${id}"`,
  FAILED_TO_ARCHIVE: (id: string) => `Failed to archive news with id "${id}"`,
  FAILED_TO_HIDE: (id: string) => `Failed to hide news with id "${id}"`,
  FAILED_TO_DELETE: (id: string) => `News with id "${id}" not found or could not be deleted`
};
