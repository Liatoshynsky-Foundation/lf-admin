import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/interfaces/graphql/schemas/**/*.graphql',

  documents: ['app/types/graphql/**/*.graphql', '!app/types/graphql/generated/**'],

  overwrite: true,

  generates: {
    './app/types/graphql/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true
      }
    }
  },

  hooks: {
    afterOneFileWrite: ['prettier --write']
  }
};

export default config;
