import { NextRequest, NextResponse } from 'next/server';

import { getApolloServer } from '~/api/graphql/apolloServer';
import { createGraphQLContext } from '~/api/graphql/context';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const server = getApolloServer();
  const contextValue = await createGraphQLContext(req);
  const apolloResponse = await server.executeOperation(
    {
      query: body.query,
      variables: body.variables,
      operationName: body.operationName
    },
    {
      contextValue: {
        ...contextValue
      }
    }
  );

  if (apolloResponse.body.kind === 'single') {
    const { singleResult } = apolloResponse.body;

    const res = NextResponse.json(
      {
        ...(singleResult?.data ? { data: singleResult.data } : {}),
        ...(singleResult?.errors ? { errors: singleResult.errors } : {})
      },
      { status: 200 }
    );

    contextValue.cookieActions.forEach((action) => {
      if (action.action === 'set' && action.value) {
        res.cookies.set(action.name, action.value, action.options);
      } else if (action.action === 'delete') {
        res.cookies.delete({
          ...action.options,
          name: action.name
        });
      }
    });

    return res;
  } else {
    return NextResponse.json({ errors: [{ message: 'Incremental delivery is not supported.' }] }, { status: 501 });
  }
}

export const GET = POST;
