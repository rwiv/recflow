import { drizzle } from 'drizzle-orm/node-postgres';

import { readEnv } from '@/common/config/env.js';

export const db = drizzle(readEnv().pg.url);
