import path from 'node:path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const root = path.resolve(__dirname, '..');

export default defineConfig({
  root: path.join(__dirname, 'fixture'),
  plugins: [svgr({ include: '**/*.svg' })],
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      'next/navigation': path.join(__dirname, 'fixture/navigation.ts'),
      'next/link': path.join(root, '.storybook/mocks/next-link.tsx'),
      'next/image': path.join(root, '.storybook/mocks/next-image.tsx'),
      '~/ds-components': path.join(root, 'app/shared/components/design-system'),
      '~/public': path.join(root, 'public'),
      '~/domain': path.join(root, 'src/domain'),
      '~': path.join(root, 'app')
    }
  },
  server: { host: '127.0.0.1', port: 4173, strictPort: true, fs: { allow: [root] } }
});
