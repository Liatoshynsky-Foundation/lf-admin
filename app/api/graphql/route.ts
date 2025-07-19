import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

import { createRequestContainer } from '~/container/index';
import { schema } from '~/interfaces/graphql';

let server: ApolloServer | null = null;

if (!server) {
  server = new ApolloServer({
    schema
  });
}

export const GET = startServerAndCreateNextHandler(server, {
  context: async () => {
    const container = createRequestContainer();
    return { container };
  }
});

export const POST = GET;
