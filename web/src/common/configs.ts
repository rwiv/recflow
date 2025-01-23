import { env } from '@/common/env.ts';

const isDev = env.MODE === 'development';
const isProd = env.MODE === 'production';
const isStage = env.MODE === 'stage';

const protocol = env.VITE_PROTOCOL;
const host = env.VITE_HOST;
const port = env.VITE_PORT;
const domain = isDev ? `${host}:${port}` : window.location.host;

const endpoint = `${protocol}://${domain}`;

export const configs = {
  isDev,
  isProd,
  isStage,
  protocol,
  host,
  port,
  domain,
  endpoint,
};
