import { isValidCalendarDate,throwBadUserInput } from './validationHelpers';
import { newsValidationErrors } from '~/src/constants/errors';

export const validateNewsDate = (newsDate?: string): void => {
  if (!newsDate) return;
  if (!isValidCalendarDate(newsDate)) throwBadUserInput(newsValidationErrors.PUBLICATION_DATA_INVALID, ['newsDate']);
};
