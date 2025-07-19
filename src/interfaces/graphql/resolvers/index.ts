import { Mutation as AdminMutation } from './admin/Mutation';

export const resolvers = {
  Mutation: {
    ...AdminMutation
  }
};
