import { readEnv } from '../../common/config/env.js';
import { drizzle } from 'drizzle-orm/node-postgres';

export const db = drizzle(readEnv().pg.url);
