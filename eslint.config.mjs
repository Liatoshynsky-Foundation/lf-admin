import { FlatCompat } from '@eslint/eslintrc';
import pluginImport from 'eslint-plugin-import';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  {
    ignores: ['node_modules', '.next', 'coverage', '.idea', '.vscode', 'app/types/graphql/generated/']
  },
  {
    rules: {
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      indent: ['error', 2],
      'no-console': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      'no-var': 'error',
      'prefer-const': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'simple-import-sort/exports': 'error',
      'import/no-duplicates': 'error',
      'unused-imports/no-unused-imports': 'error'
    }
  },
  {
    plugins: {
      'simple-import-sort': pluginSimpleImportSort,
      import: pluginImport,
      'unused-imports': pluginUnusedImports
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^(\\u0000|@?\\w)']]
        }
      ],
      'simple-import-sort/exports': 'error'
    }
  }
];

export default eslintConfig;
