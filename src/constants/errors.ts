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
