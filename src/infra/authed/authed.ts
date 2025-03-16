import { z } from 'zod';
import { Cookie } from './types.js';

export interface Authed {
  requestChzzkCookies(): Promise<Cookie[]>;
  requestSoopCookies(): Promise<Cookie[]>;
}

export const cookiesResponse = z.object({
  cookies: z.string(),
});
export type CookiesResponse = z.infer<typeof cookiesResponse>;
