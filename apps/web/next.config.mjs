import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const zodEntry = require.resolve('zod');

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  eslint: {
    dirs: ['app', 'components', 'lib'],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve = webpackConfig.resolve ?? {};
    webpackConfig.resolve.alias = {
      ...(webpackConfig.resolve.alias ?? {}),
      'zod/v4/core': zodEntry,
    };

    return webpackConfig;
  },
};

export default config;
