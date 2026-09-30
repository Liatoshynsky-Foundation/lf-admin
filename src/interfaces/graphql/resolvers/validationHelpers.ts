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