import { GraphQLScalarType, Kind, ValueNode } from 'graphql';

import { authMutation as AdminMutation } from './admin/AuthMutation';
import { blobMutations as BlobMutation } from './blobStorage/blobMutation';
import { MediaMentionsMutation } from './media-mentions/Mutation';
import { MediaMentionsQuery } from './media-mentions/Query';
import { NewsMutation } from './news/NewsMutation';
import { NewsQuery } from './news/NewsQuery';
import { PageMutation } from './page/PageMutation';
import { Query as AdminQuery } from './page/Query';

const JSONScalar: GraphQLScalarType = new GraphQLScalarType({
  name: 'JSON',
  description: 'The `JSON` scalar type represents JSON values as specified by ECMA-404',
  serialize(value: unknown) {
    return value;
  },
  parseValue(value: unknown) {
    return value;
  },
  parseLiteral(ast: ValueNode): unknown {
    /* eslint-disable */
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.INT:
      case Kind.FLOAT:
        return Number.parseFloat(ast.value);
      case Kind.OBJECT: {
        const value = Object.create(null) as Record<string, unknown>;
        ast.fields.forEach((field) => {
          value[field.name.value] = JSONScalar.parseLiteral(field.value);
        });
        return value;
      }
      case Kind.LIST:
        return ast.values.map((n: ValueNode) => JSONScalar.parseLiteral(n));
      default:
        return null;
    }
  }
});

export const resolvers = {
  JSON: JSONScalar,
  Mutation: {
    ...AdminMutation,
    ...BlobMutation,
    ...PageMutation,
    ...NewsMutation,
    ...MediaMentionsMutation
  },
  Query: {
    ...AdminQuery,
    ...NewsQuery,
    ...MediaMentionsQuery
  }
};
