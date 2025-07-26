import { ApolloServer } from '@apollo/server';

import { schema } from '~/interfaces/graphql';

let apolloServer: ApolloServer | null = null;

export function getApolloServer(): ApolloServer {
  apolloServer ??= new ApolloServer({ schema });
  return apolloServer;
}
