import { GraphQLError } from 'graphql';

export const throwBadUserInput = (message: string, fields: string[]): void => {
  if (fields.length === 0) return;

  throw new GraphQLError(message, {
    extensions: {
      code: 'BAD_USER_INPUT',
      fields
    }
  });
};

const CALENDAR_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})/;

export const isValidCalendarDate = (dateString: string = ''): boolean => {
  const match = CALENDAR_DATE_REGEX.exec(dateString);

  if (!match) return false;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return (
    date.getFullYear() === Number(year) && 
    date.getMonth() === Number(month) - 1 && 
    date.getDate() === Number(day)
  );
};
