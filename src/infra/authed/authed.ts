import { z } from 'zod';
import { Cookie } from './types.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';

export interface Authed {
  requestCookie(platform: PlatformName): Promise<string>;
  requestChzzkCookies(): Promise<Cookie[]>;
  requestSoopCookies(): Promise<Cookie[]>;
}

export const cookiesResponse = z.object({
  cookies: z.string(),
});
export type CookiesResponse = z.infer<typeof cookiesResponse>;
