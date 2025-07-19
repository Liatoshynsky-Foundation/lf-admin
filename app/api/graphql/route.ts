import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';

import { createRequestContainer } from '~/container/index';
import { schema } from '~/interfaces/graphql';

const server = new ApolloServer({ schema });

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async () => {
    const container = createRequestContainer();
    return { container };
  }
});

export async function GET(req: NextRequest) {
  return handler(req);
}

export const POST = GET;
