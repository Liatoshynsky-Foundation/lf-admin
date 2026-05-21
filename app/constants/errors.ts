export const errors = {
  MISSING_DB_OR_HOST: '❌ MONGO_DB and MONGO_HOST must be defined',
  MISSING_CREDENTIALS: '❌ Credentials are missing for remote MongoDB',
  MISSING_MONGO_URL: '❌ mongoUrl is not defined or is empty',
  FAILED_TO_CONNECT_DB: '❌ Failed to connect to the database',
  RESPONSE_NOT_OK: '❌ HTTP error! Response is not 200 OK',
  FAILED_TO_REFRESH: 'Failed to refresh token',
  AZURE_URL_NOT_DEFINED: 'AZURE_SAS_URL environment variable is not defined'
};

export const loginErrors = {
  INVALID_CREDENTIALS: 'Неправильний логін або пароль',
  EMPTY_USERNAME: 'Логін не може бути порожнім',
  EMPTY_PASSWORD: 'Пароль не може бути порожнім', //NOSONAR
  UNEXPECTED_ERROR: 'Непередбачена помилка. Спробуйте ще раз.'
};

export const cropperErrors = {
  NO_FRAME: 'Оберіть необхідну зону'
};

export const graphqlErrors = {
  UNAUTHENTICATED: {
    message: 'You must be logged in to access this resource.',
    code: 'UNAUTHENTICATED'
  },
  DRAFT_BLOCKS_REQUIRED: {
    message: 'Draft blocks payload is required',
    code: 'BAD_USER_INPUT'
  }
};

export const newsErrors = {
  NETWORK_ERROR_CREATE: 'Network error while creating news',
  FAILED_TO_CREATE: 'Failed to create news',
  NETWORK_ERROR_UPDATE: 'Network error while updating news',
  FAILED_TO_UPDATE: 'Failed to update news',
  NETWORK_ERROR_PUBLISH: 'Network error while publishing news',
  FAILED_TO_PUBLISH: 'Failed to publish news',
  NETWORK_ERROR_UNPUBLISH: 'Network error while unpublishing news',
  FAILED_TO_UNPUBLISH: 'Failed to unpublish news',
  NETWORK_ERROR_ARCHIVE: 'Network error while archiving news',
  FAILED_TO_ARCHIVE: 'Failed to archive news',
  NETWORK_ERROR_HIDE: 'Network error while hiding news',
  FAILED_TO_HIDE: 'Failed to hide news',
  NETWORK_ERROR_DELETE: 'Network error while deleting news',
  FAILED_TO_DELETE: 'Failed to delete news',
  NETWORK_ERROR_STATUS_UPDATE: 'Network error while updating news status',
  FAILED_TO_UPDATE_STATUS: 'Failed to update news status'
};

export const EventsErrors = {
  NETWORK_ERROR_CREATE: 'Network error while creating event',
  FAILED_TO_CREATE: 'Failed to create event',
  NETWORK_ERROR_UPDATE: 'Network error while updating event',
  FAILED_TO_UPDATE: 'Failed to update event',
  NETWORK_ERROR_PUBLISH: 'Network error while publishing event',
  FAILED_TO_PUBLISH: 'Failed to publish event',
  NETWORK_ERROR_UNPUBLISH: 'Network error while unpublishing event',
  FAILED_TO_UNPUBLISH: 'Failed to unpublish event',
  NETWORK_ERROR_ARCHIVE: 'Network error while archiving event',
  FAILED_TO_ARCHIVE: 'Failed to archive event',
  NETWORK_ERROR_HIDE: 'Network error while hiding event',
  FAILED_TO_HIDE: 'Failed to hide event',
  NETWORK_ERROR_DELETE: 'Network error while deleting event',
  FAILED_TO_DELETE: 'Failed to delete event',
  NETWORK_ERROR_STATUS_UPDATE: 'Network error while updating event status',
  FAILED_TO_UPDATE_STATUS: 'Failed to update event status'
};

export const galleryErrors = {
  FAILED_TO_FETCH: 'Upload files failed'
};

export const MediaMentionsErrors = {
  NETWORK_ERROR_CREATE: 'Network error while creating media mention',
  FAILED_TO_CREATE: 'Failed to create media mention',
  NETWORK_ERROR_UPDATE: 'Network error while updating media mention',
  FAILED_TO_UPDATE: 'Failed to update media mention',
  NETWORK_ERROR_PUBLISH: 'Network error while publishing media mention',
  FAILED_TO_PUBLISH: 'Failed to publish media mention',
  NETWORK_ERROR_UNPUBLISH: 'Network error while unpublishing media mention',
  FAILED_TO_UNPUBLISH: 'Failed to unpublish media mention',
  NETWORK_ERROR_ARCHIVE: 'Network error while archiving media mention',
  FAILED_TO_ARCHIVE: 'Failed to archive media mention',
  NETWORK_ERROR_HIDE: 'Network error while hiding media mention',
  FAILED_TO_HIDE: 'Failed to hide media mention',
  NETWORK_ERROR_DELETE: 'Network error while deleting media mention',
  FAILED_TO_DELETE: 'Failed to delete media mention'
};
