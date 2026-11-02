import packageJson from './package.json';

// ----------------------------------------------------------------------

const resolvedServerUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  'https://youplex.cc'
).replace(/\/+$/, '');

const finalServerUrl = resolvedServerUrl.includes('youplex.site')
  ? 'https://youplex.cc'
  : resolvedServerUrl;

export const CONFIG = {
  site: {
    name: process.env.APP_NAME ?? 'Youplex',
    serverUrl: finalServerUrl,
    assetURL: process.env.NEXT_PUBLIC_ASSET_URL ?? '',
    basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
    version: packageJson.version,
  },
  assetsDir: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  isStaticExport: JSON.parse(`${process.env.BUILD_STATIC_EXPORT ?? 'false'}`),
};
