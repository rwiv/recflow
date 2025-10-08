import fs from 'fs';
import { createClient, RedisClientType } from 'redis';
import { Redis } from 'ioredis';
import { log } from 'jslog';
import { RedisClientOptions } from '@redis/client';
import { stacktrace } from './errors/utils.js';

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  caPath?: string;
}

export async function createRedisClient(conf: RedisConfig, database: number = 0, logging: boolean = false) {
  const { password, caPath } = conf;
  const url = `redis://${conf.host}:${conf.port}`;
  const opts: RedisClientOptions = { url, password, database };
  if (caPath) {
    const ca = await fs.promises.readFile(caPath, 'utf-8');
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

export function createIoRedisClient(conf: RedisConfig, db: number = 0): Redis {
  return new Redis({
    host: conf.host,
    port: conf.port,
    password: conf.password,
    db,
    maxRetriesPerRequest: null,
  });
}
