import { ApolloServer } from '@apollo/server';
import depthLimit from 'graphql-depth-limit';
import { createComplexityLimitRule } from 'graphql-validation-complexity';

import { schema } from '~/interfaces/graphql';
import logger from '~/middleware/logger/logger';

let apolloServer: ApolloServer | null = null;

export const getApolloServer = (): ApolloServer => {
  apolloServer ??= new ApolloServer({
    schema,
    introspection: process.env.NODE_ENV !== 'production',
    validationRules: [
      depthLimit(5),
      createComplexityLimitRule(1500, { onCost: (cost: number) => logger.log('Query cost:', cost) })
    ]
  });
  return apolloServer;
};
