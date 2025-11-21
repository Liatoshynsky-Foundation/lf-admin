export const errors = {
  REFRESH_TOKEN_REVOKED: 'Refresh token has been revoked',
  EXPIRED_ACCESS_TOKEN: 'You must be logged in to access this resource',
  FAILED_TO_UPLOAD_BLOB: 'Error during upload blob file',
  FAILED_TO_DELETE_BLOB: 'Error during delete blob file',
  FAILED_TO_GET_BLOB: 'Error during get blob file',
  BLOB_DOES_NOT_EXIST: 'Blob with this name does not exist',
  AZURE_URL_NOT_DEFINED: 'AZURE_SAS_URL environment variable is not defined',

  // Validation errors
  EMAIL_REQUIRED: 'Email is required',
  INVALID_EMAIL_FORMAT: 'Invalid email format',
  EMAIL_TOO_LONG: 'Email must not exceed 254 characters'
};

export const utilsErrors = {
  EMPTY_TITLE_FOR_SLUG: 'Title must be a non-empty string',
  NO_BASE_SLUG_AVAILABLE: 'Title produces an empty slug and no fallback slug is provided',
  EMPTY_SLUG: 'Normalized slug is empty',
  UNABLE_GENERATE_UNIQUE_SLUG: 'Unable to generate unique slug after max attempts'
};
