export const errors = {
  MISSING_DB_OR_HOST: '❌ MONGO_DB and MONGO_HOST must be defined',
  MISSING_CREDENTIALS: '❌ Credentials are missing for remote MongoDB',
  MISSING_MONGO_URL: '❌ mongoUrl is not defined or is empty',
  FAILED_TO_CONNECT_DB: '❌ Failed to connect to the database',
  RESPONSE_NOT_OK: '❌ HTTP error! Response is not 200 OK',
  FAILED_TO_REFRESH: 'Failed to refresh token'
};

export const loginErrors = {
  INVALID_CREDENTIALS: 'Неправильний логін або пароль',
  EMPTY_USERNAME: 'Логін не може бути порожнім',
  EMPTY_PASSWORD: 'Пароль не може бути порожнім',
  UNEXPECTED_ERROR: 'Непередбачена помилка. Спробуйте ще раз.'
};
