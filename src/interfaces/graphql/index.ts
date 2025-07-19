import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { resolvers } from './resolvers';

const typesArray = loadFilesSync('**/*.graphql');
const typeDefs = mergeTypeDefs(typesArray);

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
