import { RedisConfig } from '../../common/types.js';
import { createClient, RedisClientType } from 'redis';
import { log } from 'jslog';

export async function createRedisClient(conf: RedisConfig, logging: boolean = false) {
  const url = `redis://${conf.host}:${conf.port}`;
  const client = await createClient({ url, password: conf.password })
    .on('error', (err) => console.error('Redis Client Error', err))
    .connect();
  if (logging) {
    log.info('Redis Client Connected');
  }
  return client as RedisClientType;
}

export async function allKeys(client: RedisClientType, pattern: string, cnt: number = 100) {
  const keys: string[] = [];
  let cursor = 0;

  do {
    const scanResult = await client.scan(cursor, { MATCH: pattern, COUNT: cnt });
    cursor = scanResult.cursor;
    keys.push(...scanResult.keys);
  } while (cursor !== 0);

  return keys;
}
