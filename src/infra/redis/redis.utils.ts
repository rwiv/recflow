import { RedisClientType } from 'redis';

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
