import { resolve } from 'node:path';
import { defineConfig, type PluginOption, loadEnv } from "vite";
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets';
import makeManifestPlugin from './utils/plugins/make-manifest-plugin';
import { watchPublicPlugin, watchRebuildPlugin } from '@extension/hmr';
import { isDev, isProduction, watchOption } from '@extension/vite-config';

const rootDir = resolve(__dirname);
const srcDir = resolve(rootDir, 'src');

const outDir = resolve(rootDir, '..', 'dist');

export default defineConfig(({ mode }) => {
  // Load environment variables from the parent directory
  const env = loadEnv(mode, resolve(rootDir, '..'), 'VITE_');
  const owebAppOrigin = env.VITE_OWEB_APP_ORIGIN || process.env.VITE_OWEB_APP_ORIGIN || 'https://oweb.one';
  const owebApiBase =
    env.VITE_OWEB_API_BASE || process.env.VITE_OWEB_API_BASE || `${owebAppOrigin}/api/extension/v1`;
  const owebProductBuild =
    (env.VITE_OWEB_PRODUCT_BUILD || process.env.VITE_OWEB_PRODUCT_BUILD || 'true') === 'true';

  return {
  resolve: {
    alias: {
      '@root': rootDir,
      '@src': srcDir,
      '@assets': resolve(srcDir, 'assets'),
    },
    conditions: ['browser', 'module', 'import', 'default'],
    mainFields: ['browser', 'module', 'main']
  },
  server: {
    // Restrict CORS to only allow localhost
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true
    },
    host: 'localhost',
    sourcemapIgnoreList: false,
  },
  plugins: [
    libAssetsPlugin({
      outputPath: outDir,
    }) as PluginOption,
    watchPublicPlugin(),
    makeManifestPlugin({ outDir }),
    isDev && watchRebuildPlugin({ reload: true, id: 'chrome-extension-hmr' }),
  ],
  publicDir: resolve(rootDir, 'public'),
  build: {
    lib: {
      formats: ['iife'],
      entry: resolve(__dirname, 'src/background/index.ts'),
      name: 'BackgroundScript',
      fileName: 'background',
    },
    outDir,
    emptyOutDir: false,
    sourcemap: isDev,
    minify: isProduction,
    reportCompressedSize: isProduction,
    watch: watchOption,
    rollupOptions: {
      external: [
        'chrome',
        // 'chromium-bidi/lib/cjs/bidiMapper/BidiMapper.js'
      ],
    },
  },

  define: {
    'import.meta.env.DEV': isDev,
    'import.meta.env.VITE_POSTHOG_API_KEY': JSON.stringify(env.VITE_POSTHOG_API_KEY || process.env.VITE_POSTHOG_API_KEY || ''),
    __OWEB_APP_ORIGIN__: JSON.stringify(owebAppOrigin),
    __OWEB_API_BASE__: JSON.stringify(owebApiBase),
    __OWEB_PRODUCT_BUILD__: owebProductBuild,
  },

  envDir: '../',
  envPrefix: 'VITE_',
  };
});
