import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';

describe('GraphQL schema (opus SDL wiring)', () => {
  it('builds the type system and exposes Opus type and createOpus mutation', () => {
    const typesArray = loadFilesSync('src/interfaces/graphql/schemas/**/*.graphql');
    const typeDefs = mergeTypeDefs(typesArray);

    const schema = makeExecutableSchema({ typeDefs });

    expect(schema.getType('Opus')).toBeDefined();
    expect(schema.getType('CreateOpusInput')).toBeDefined();
    expect(schema.getType('Composition')).toBeDefined();

    const mutationFields = schema.getMutationType()?.getFields() ?? {};
    expect(mutationFields.createOpus).toBeDefined();
    expect(mutationFields.updateOpus).toBeDefined();
    expect(mutationFields.deleteOpus).toBeDefined();

    const queryFields = schema.getQueryType()?.getFields() ?? {};
    expect(queryFields.allOpuses).toBeDefined();
    expect(queryFields.opusById).toBeDefined();
  });
});
