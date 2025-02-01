import { it } from 'vitest';
import { drizzle } from 'drizzle-orm/node-postgres';
import { readEnv } from '../../common/env.js';
import { ChannelRecord } from './types.js';
import { v4 } from 'uuid';
import { channels } from './schema.js';

it('test', async () => {
  const env = readEnv();
  const db = drizzle(env.pg.url, {
    schema: { channels },
  });

  await db.insert(channels).values(mockChan(3));
  const records = await db.query.channels.findMany();
  console.log(records);

  await db.delete(channels);
});

function mockChan(n: number): ChannelRecord {
  return {
    id: v4().replaceAll('-', ''),
    ptype: 'chzzk',
    pid: `chzzk${n}`,
    username: `user${n}`,
    followerCount: 10,
    priority: 'main',
    createdAt: new Date(),
    updatedAt: undefined,
  };
}
