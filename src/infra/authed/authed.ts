import { z } from 'zod';
import { Cookie } from './types.js';

export interface Authed {
  requestChzzkCookies(): Promise<Cookie[]>;
  requestSoopAccount(): Promise<SoopAccount>;
}

export const cookiesResponse = z.object({
  cookies: z.string(),
});
export type CookiesResponse = z.infer<typeof cookiesResponse>;

export const soopAccount = z.object({
  username: z.string(),
  password: z.string(),
});
export type SoopAccount = z.infer<typeof soopAccount>;
