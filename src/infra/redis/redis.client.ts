import fs from 'fs';
import { RedisConfig } from '../../common/config/config.types.js';
import { createClient, RedisClientType } from 'redis';
import { log } from 'jslog';
import { RedisClientOptions } from '@redis/client';
import { stacktrace } from '../../utils/errors/utils.js';

export async function createRedisClient(conf: RedisConfig, logging: boolean = false) {
  const url = `redis://${conf.host}:${conf.port}`;
  const opts: RedisClientOptions = {
    url,
    password: conf.password,
  };
  if (conf.caPath) {
    const ca = await fs.promises.readFile(conf.caPath, 'utf-8');
    opts.socket = { tls: true, ca };
  }
  const client = await createClient(opts)
    .on('error', (err) => log.debug('Redis Client Error', { stack_trace: stacktrace(err) }))
    .connect();
  if (logging) {
    log.info('Redis Client Connected');
  }
  return client as RedisClientType;
}
