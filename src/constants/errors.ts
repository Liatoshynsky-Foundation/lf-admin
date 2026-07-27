import { newError } from '~/interfaces/error';

export const errors = {
  REFRESH_TOKEN_REVOKED: 'Refresh token has been revoked',
  EXPIRED_ACCESS_TOKEN: 'You must be logged in to access this resource',
  FAILED_TO_UPLOAD_BLOB: 'Error during upload blob file',
  FAILED_TO_DELETE_BLOB: 'Error during delete blob file',
  FAILED_TO_GET_BLOB: 'Error during get blob file',
  BLOB_DOES_NOT_EXIST: 'Blob with this name does not exist',

  // Validation errors
  EMAIL_REQUIRED: 'Email is required',
  INVALID_EMAIL_FORMAT: 'Invalid email format',
  EMAIL_TOO_LONG: 'Email must not exceed 254 characters',
  WRONG_EMAIL: 'WRONG_EMAIL',
  WRONG_PASS: 'WRONG_PASSWORD'
};

export const utilsErrors = {
  EMPTY_TITLE_FOR_SLUG: 'Title must be a non-empty string',
  NO_BASE_SLUG_AVAILABLE: 'Title produces an empty slug and no fallback slug is provided',
  EMPTY_SLUG: 'Normalized slug is empty',
  SLUG_GENERATION_ERROR: 'Unable to generate unique slug after max attempts'
};

export const newsServiceErrors = {
  SLUG_ALREADY_EXISTS: (slug: string) => `News with slug "${slug}" already exists`,
  NEWS_NOT_FOUND: (id: string) => `News with id "${id}" not found`,
  FAILED_TO_PUBLISH: (id: string) => `Failed to publish news with id "${id}"`,
  FAILED_TO_UNPUBLISH: (id: string) => `Failed to unpublish news with id "${id}"`,
  FAILED_TO_ARCHIVE: (id: string) => `Failed to archive news with id "${id}"`,
  FAILED_TO_HIDE: (id: string) => `Failed to hide news with id "${id}"`,
  FAILED_TO_DELETE: (id: string) => `News with id "${id}" not found or could not be deleted`,
  TITLE_REQUIRED_FOR_SLUG: 'Title is required to generate a slug',
  TITLE_TOO_SHORT_FOR_SLUG: 'Title must be at least 2 characters long to generate a slug'
};

export const opusServiceErrors = {
  NUMBER_ALREADY_EXISTS: (number: number) => `Opus with number "${number}" already exists`,
  NUMBER_GENERATION_FAILED: 'Failed to generate a unique opus number',
  NUMBER_NOT_NEGATIVE: 'Opus number cannot be negative',
  NAME_REQUIRED_FOR_SLUG: 'Opus name is required to generate a slug',
  NAME_LENGTH_INVALID: 'Opus name must contain from 2 to 250 characters',
  ADDITIONAL_TEXT_TOO_LONG: 'Additional text cannot exceed 40 characters',
  CREATION_YEAR_REQUIRED: 'Creation year is required',
  CREATION_YEAR_INVALID: 'Creation year must be between 1900 and 2100',
  DATES_NOTE_TOO_LONG: 'Dates note cannot exceed 40 characters',
  GENRE_TOO_LONG: 'Genre cannot exceed 250 characters',

  GALLERY_TOO_MANY_PHOTOS: 'A gallery cannot contain more than 20 photos.',
  GALLERY_ALT_TEXT_REQUIRED: 'Photo alt text is required and must contain between 2 and 250 characters.',
  GALLERY_DESCRIPTION_INVALID: 'The photo caption must contain between 2 and 250 characters.',

  PERFORMANCES_TOO_MANY: 'You can add up to 5 performances.',
  PERFORMANCES_URL_REQUIRED: 'A URL link for the video is required.',
  PERFORMANCES_TITLE_INVALID: 'The video caption is required and must contain between 2 and 250 characters.',

  OPUS_NOT_FOUND: (id: string) => `Opus with id "${id}" not found`,
  FAILED_TO_DELETE: (id: string) => `Opus with id "${id}" not found or could not be deleted`
};

export const MediaMentionsServiceErrors = {
  INVALID_URL: newError('The provided URL is invalid'),
  NOT_FOUND: newError('Media mention not found'),
  ALREADY_PUBLISHED: newError('Media mention is already published'),
  ALREADY_DRAFT: newError('Media mention is already in draft status'),
  INVALID_ID: newError('The provided ID is invalid'),
  NO_PUBLISHED_MEDIA: newError('No published media mentions found')
};
