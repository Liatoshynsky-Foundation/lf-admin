import { isValidCalendarDate, throwBadUserInput } from './validationHelpers';
import { eventValidationErrors } from '~/src/constants/errors';

export const validateEventStartDate = (eventDateTimeStart?: string): void => {
  throwBadUserInput(
    eventValidationErrors.START_DATE_REQUIRED,
    !eventDateTimeStart?.trim() ? ['eventDateTimeStart'] : []
  );

  throwBadUserInput(
    eventValidationErrors.START_DATE_INVALID,
    !isValidCalendarDate(eventDateTimeStart) || Number.isNaN(Date.parse(eventDateTimeStart ?? ''))
      ? ['eventDateTimeStart']
      : []
  );
};
