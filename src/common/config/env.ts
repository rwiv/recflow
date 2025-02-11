import { DEFAULT_NTFY_TOPIC } from '../data/constants.js';
import { AmqpConfig, PostgresConfig, RedisConfig } from './config.types.js';
import dotenv from 'dotenv';
import { log } from 'jslog';
import path from 'path';
import { parseInteger } from '../../utils/number.js';

export interface Env {
  nodeEnv: string;
  configPath: string;
  appPort: number;
  streamqUrl: string;
  streamqQsize: number;
  authedUrl: string;
  authedEncKey: string;
  ntfyEndpoint: string;
  ntfyTopic: string;
  redis: RedisConfig;
  amqp: AmqpConfig;
  pg: PostgresConfig;
}

export function readEnv(): Env {
  // NODE_ENV
  let nodeEnv = process.env.NODE_ENV;
  if (nodeEnv !== 'prod') {
    dotenv.config({ path: path.resolve('dev', '.env') });
    log.info('dotenv loaded');
  }
  nodeEnv = process.env.NODE_ENV;
  if (!nodeEnv) {
    nodeEnv = 'dev';
  }

  // CONFIG_PATH
  const configPath = process.env.CONFIG_PATH;
  if (configPath === undefined) throw Error('configPath is undefined');

  // APP_PORT
  const appPort = parseInteger(process.env.APP_PORT, 'appPort');

  // streamq
  const streamqUrl = process.env.STREAMQ_URL;
  if (streamqUrl === undefined) throw Error('streamq data is undefined');
  const streamqQsize = parseInteger(process.env.STREAMQ_QSIZE, 'streamqQsize');

  // authed
  const authedUrl = process.env.AUTHED_URL;
  const authedEncKey = process.env.AUTHED_ENCKEY;
  if (authedUrl === undefined || authedEncKey === undefined) throw Error('authed data is undefined');
  if (authedEncKey.length !== 32) throw new Error('Key must be 32 bytes');

  // ntfy
  const ntfyEndpoint = process.env.NTFY_ENDPOINT;
  const ntfyTopic = process.env.NTFY_TOPIC ?? DEFAULT_NTFY_TOPIC;
  if (ntfyEndpoint === undefined || ntfyTopic === undefined) throw Error('ntfy data is undefined');

  // redis
  const redisHost = process.env.REDIS_HOST;
  const redisPassword = process.env.REDIS_PASSWORD;
  const redisPort = parseInteger(process.env.REDIS_PORT, 'redisPort');
  if (redisHost === undefined || redisPassword === undefined) {
    throw Error('redis data is undefined');
  }
  const redis: RedisConfig = {
    host: redisHost,
    port: redisPort,
    password: redisPassword,
  };

  // amqp
  const amqpHost = process.env.AMQP_HOST;
  const amqpUsername = process.env.AMQP_USERNAME;
  const amqpPassword = process.env.AMQP_PASSWORD;
  if (amqpHost === undefined || amqpUsername === undefined || amqpPassword === undefined) {
    throw Error('amqp data is undefined');
  }
  const amqpPort = parseInteger(process.env.AMQP_PORT, 'amqpPort');
  const amqpHttpPort = parseInteger(process.env.AMQP_HTTP_PORT, 'amqpHttpPort');
  const amqp: AmqpConfig = {
    host: amqpHost,
    port: amqpPort,
    httpPort: amqpHttpPort,
    username: amqpUsername,
    password: amqpPassword,
  };

  // postgres
  const pgHost = process.env.PG_HOST;
  let pgPortStr = process.env.PG_PORT;
  if (process.env.USING_PG_PROD_PORT === 'true') {
    pgPortStr = process.env.PG_PROD_PORT;
  }
  const pgDatabase = process.env.PG_DATABASE;
  const pgUsername = process.env.PG_USERNAME;
  const pgPassword = process.env.PG_PASSWORD;
  if (
    pgHost === undefined ||
    pgPortStr === undefined ||
    pgDatabase === undefined ||
    pgUsername === undefined ||
    pgPassword === undefined
  ) {
    throw Error('pg data is undefined');
  }
  const pgPort = parseInteger(pgPortStr, 'pgPort');
  const url = `postgres://${pgUsername}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}`;
  const pg: PostgresConfig = {
    host: pgHost,
    port: pgPort,
    database: pgDatabase,
    username: pgUsername,
    password: pgPassword,
    url,
  };

  return {
    nodeEnv,
    appPort,
    configPath,
    streamqUrl,
    streamqQsize,
    authedUrl,
    authedEncKey,
    ntfyEndpoint,
    ntfyTopic,
    redis,
    amqp,
    pg,
  };
}
