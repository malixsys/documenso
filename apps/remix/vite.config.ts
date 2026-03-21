import { lingui } from '@lingui/vite-plugin';
import { reactRouter } from '@react-router/dev/vite';
import autoprefixer from 'autoprefixer';
import { createRequire } from 'node:module';
import path from 'node:path';
import tailwindcss from 'tailwindcss';
import { defineConfig, normalizePath } from 'vite';
import macrosPlugin from 'vite-plugin-babel-macros';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tsconfigPaths from 'vite-tsconfig-paths';

const require = createRequire(import.meta.url);

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const cMapsDir = normalizePath(path.join(pdfjsDistPath, 'cmaps'));

/**
 * Note: We load the env variables externally so we can have runtime enviroment variables
 * for docker.
 *
 * Do not configure any envs here.
 */
export default defineConfig(({ isSsrBuild }) => ({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: './server/app.ts',
          external: [
            '@napi-rs/canvas',
            '@node-rs/bcrypt',
            '@aws-sdk/cloudfront-signer',
            'nodemailer',
            'sharp',
            /playwright/,
            '@playwright/browser-chromium',
            'skia-canvas',
          ],
        }
      : {
          external: [
            '@napi-rs/canvas',
            '@node-rs/bcrypt',
            '@aws-sdk/cloudfront-signer',
            'nodemailer',
            /playwright/,
            '@playwright/browser-chromium',
            'skia-canvas',
          ],
        },
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    strictPort: true,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: cMapsDir,
          dest: 'static',
        },
      ],
    }),
    reactRouter(),
    macrosPlugin(),
    lingui(),
    tsconfigPaths(),
  ],
  ssr: {
    noExternal: true,
    external: [
      'react',
      'react-dom',
      'react-router',
      '@node-rs/bcrypt',
      '@prisma/client',
      '@documenso/tailwind-config',
      'sharp',
    ],
  },
  optimizeDeps: {
    entries: ['./app/**/*', '../../packages/ui/**/*', '../../packages/lib/**/*'],
    include: ['prop-types', 'file-selector', 'attr-accept'],
    exclude: [
      'node_modules',
      '@node-rs/bcrypt',
      'sharp',
    ],
  },
  resolve: {
    alias: {
      https: 'node:https',
      // Only alias react/react-dom for client builds. For SSR builds, they are
      // externalized via ssr.external and must remain bare specifiers so Vite
      // doesn't resolve them to absolute paths (which bypasses externalization).
      ...(isSsrBuild
        ? {}
        : {
            react: path.resolve(__dirname, '../../node_modules/react'),
            'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
          }),
      '.prisma/client/default': path.resolve(
        __dirname,
        '../../node_modules/.prisma/client/default.js',
      ),
      '.prisma/client/index-browser': path.resolve(
        __dirname,
        '../../node_modules/.prisma/client/index-browser.js',
      ),
      canvas: path.resolve(__dirname, './app/types/empty-module.ts'),
    },
  },
}));
