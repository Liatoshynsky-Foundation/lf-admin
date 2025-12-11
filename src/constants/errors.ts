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
  SLUG_GENERATION_ERROR: 'Unable to generate unique slug after max attempts'
};

export const eventServiceErrors = {
  SLUG_ALREADY_EXISTS: (slug: string) => `Event with slug "${slug}" already exists`,
  EVENT_NOT_FOUND: (id: string) => `Event with id "${id}" not found`,
  EVENT_NOT_FOUND_BY_SLUG: (slug: string) => `Event with slug "${slug}" not found`,
  FAILED_TO_PUBLISH: (id: string) => `Failed to publish event with id "${id}"`,
  FAILED_TO_UNPUBLISH: (id: string) => `Failed to unpublish event with id "${id}"`,
  FAILED_TO_ARCHIVE: (id: string) => `Failed to archive event with id "${id}"`,
  FAILED_TO_HIDE: (id: string) => `Failed to hide event with id "${id}"`,
  FAILED_TO_SET_EDITING: (id: string) => `Failed to set editing status for event with id "${id}"`,
  FAILED_TO_DELETE: (id: string) => `Event with id "${id}" not found or could not be deleted`,
  TITLE_REQUIRED_FOR_SLUG: 'Title is required to generate a slug',
  EVENT_LINK_REQUIRED: 'Event link is required'
};
