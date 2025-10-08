import { z } from 'zod';

export const stdlLocationType = z.enum(['local', 'proxy_domestic', 'proxy_overseas']);
export type StdlLocationType = z.infer<typeof stdlLocationType>;
