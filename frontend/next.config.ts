import type { NextConfig } from 'next';

const getImagesConfig = (): NextConfig['images'] => ({
  domains: ['example.com'],
});

const getI18nConfig = (): NextConfig['i18n'] => ({
  locales: ['en'],
  defaultLocale: 'en',
});

const nextConfig: NextConfig = {
  ...getImagesConfig(),
  ...getI18nConfig(),
  /* other config options here */
};

export default nextConfig;