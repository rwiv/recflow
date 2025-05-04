import { createClient, RedisClientType } from 'redis';
import { log } from 'jslog';
import { stacktrace } from '../errors/utils.js';

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
}

export async function createRedisClient(conf: RedisConfig, logging: boolean = false) {
  const url = `redis://${conf.host}:${conf.port}`;
  const client = await createClient({ url, password: conf.password })
    .on('error', (err) => log.error('Redis Client Error', { stacktrace: stacktrace(err) }))
    .connect();
  if (logging) {
    log.info('Redis Client Connected');
  }
  return client as RedisClientType;
}
