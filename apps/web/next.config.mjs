/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    serverActions: true,
  },
  reactStrictMode: true,
  eslint: {
    dirs: ['app', 'components', 'lib'],
  },
};

export default config;
