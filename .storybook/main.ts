import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import svgr from 'vite-plugin-svgr';

const config: StorybookConfig = {
  stories: ['../app/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../public'],
  viteFinal: async (config) => {
    const originalOnWarn = config.build?.rollupOptions?.onwarn;

    config.publicDir = false;

    config.esbuild = {
      ...(typeof config.esbuild === 'object' ? config.esbuild : {}),
      jsx: 'automatic',
      jsxImportSource: 'react',
    };

    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.exclude = Array.from(
      new Set([...(config.optimizeDeps.exclude || []), '@storybook/addon-docs', '@storybook/blocks', '@mdx-js/react'])
    );
    config.optimizeDeps.esbuildOptions = config.optimizeDeps.esbuildOptions || {};
    config.optimizeDeps.esbuildOptions.jsx = 'automatic';
    config.optimizeDeps.esbuildOptions.jsxImportSource = 'react';

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '~/src': path.resolve(__dirname, '../src'),
      '~/ds-components': path.resolve(__dirname, '../app/shared/components/design-system'),
      '~/components': path.resolve(__dirname, '../app/shared/components'),
      '~/constants': path.resolve(__dirname, '../app/constants'),
      '~/utils': path.resolve(__dirname, '../app/lib/utils'),
      '~/hooks': path.resolve(__dirname, '../app/shared/hooks'),
      '~/providers': path.resolve(__dirname, '../app/shared/providers'),
      '~/public': path.resolve(__dirname, '../public'),
      '~/lib': path.resolve(__dirname, '../app/lib'),
      '~/shared': path.resolve(__dirname, '../app/shared'),
      // Mock Next.js modules for Storybook
      'next/image': path.resolve(__dirname, './mocks/next-image.tsx'),
      'next/link': path.resolve(__dirname, './mocks/next-link.tsx'),
      '~': path.resolve(__dirname, '../app'),
    };

    config.plugins = config.plugins || [];
    config.plugins.push(svgr({ include: '**/*.svg' }));

    config.build = config.build || {};
    config.build.chunkSizeWarningLimit = 1000;
    config.build.rollupOptions = config.build.rollupOptions || {};
    config.build.rollupOptions.onwarn = (warning, warn) => {
      const isSourcemapReportingWarning = typeof warning.message === 'string' && warning.message.includes('Error when using sourcemap for reporting an error');
      const isModuleDirectiveWarning =
        warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
        typeof warning.id === 'string' &&
        (warning.id.includes('/node_modules/@mui/') ||
          warning.id.includes('/node_modules/@emotion/') ||
          warning.id.includes('/node_modules/lucide-react/') ||
          warning.id.includes('/app/'));

      const isStorybookEvalWarning = warning.code === 'EVAL' && typeof warning.id === 'string' && warning.id.includes('/node_modules/@storybook/');

      if (isSourcemapReportingWarning || isModuleDirectiveWarning || isStorybookEvalWarning) {
        return;
      }

      if (originalOnWarn) {
        originalOnWarn(warning, warn);
        return;
      }

      warn(warning);
    };

    return config;
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
