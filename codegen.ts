import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/interfaces/graphql/schemas/*.graphql',
  documents: ['src/interfaces/graphql/schemas/*.graphql', './app/types/graphql/**/*.graphql'],
  generates: {
    './app/types/graphql/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true
      }
    }
  }
};

export default config;
