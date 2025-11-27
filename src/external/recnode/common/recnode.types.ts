import { z } from 'zod';

export const recnodeLocationType = z.enum(['local', 'proxy_domestic', 'proxy_overseas']);
export type RecnodeLocationType = z.infer<typeof recnodeLocationType>;
