import { Mutation as AdminMutation } from './admin/Mutation';
import { Query as AdminQuery } from './admin/Query';

export const resolvers = {
  Mutation: {
    ...AdminMutation
  },
  Query: {
    ...AdminQuery
  }
};
