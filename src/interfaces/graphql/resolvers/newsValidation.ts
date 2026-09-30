import { throwBadUserInput } from './validationHelpers';
import { newsValidationErrors } from '~/src/constants/errors';

const NEWS_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})/;

export const validateNewsDate = (newsDate?: string): void => {
  if (!newsDate) return;

  const match = NEWS_DATE_REGEX.exec(newsDate);

  if (!match) {
    throwBadUserInput(newsValidationErrors.PUBLICATION_DATA_INVALID, ['newsDate']);
    return;
  }

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  const isValid =
    date.getFullYear() === Number(year) && 
    date.getMonth() === Number(month) - 1 && 
    date.getDate() === Number(day);

  if (!isValid) throwBadUserInput(newsValidationErrors.PUBLICATION_DATA_INVALID, ['newsDate']);
};
