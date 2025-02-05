import { DEFAULT_NTFY_TOPIC } from './consts.js';
import { AmqpConfig, PostgresConfig, RedisConfig } from './config.types.js';
import dotenv from 'dotenv';

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
    dotenv.config({ path: 'dev/.env' });
  }
  nodeEnv = process.env.NODE_ENV;
  if (!nodeEnv) {
    nodeEnv = 'dev';
  }

  // CONFIG_PATH
  const configPath = process.env.CONFIG_PATH;
  if (configPath === undefined) throw Error('configPath is undefined');

  // APP_PORT
  const appPortStr = process.env.APP_PORT;
  if (appPortStr === undefined) throw Error('appPort is undefined');
  const appPort = parseInt(appPortStr);
  if (isNaN(appPort)) throw Error('appPort is NaN');

  // streamq
  const streamqUrl = process.env.STREAMQ_URL;
  const qsizeStr = process.env.STREAMQ_QSIZE;
  if (streamqUrl === undefined || qsizeStr === undefined) throw Error('streamq data is undefined');
  const streamqQsize = parseInt(qsizeStr);
  if (isNaN(streamqQsize)) throw Error('streamqQsize is NaN');

  // authed
  const authedUrl = process.env.AUTHED_URL;
  const authedEncKey = process.env.AUTHED_ENCKEY;
  if (authedUrl === undefined || authedEncKey === undefined)
    throw Error('authed data is undefined');
  if (authedEncKey.length !== 32) throw new Error('Key must be 32 bytes');

  // ntfy
  const ntfyEndpoint = process.env.NTFY_ENDPOINT;
  const ntfyTopic = process.env.NTFY_TOPIC ?? DEFAULT_NTFY_TOPIC;
  if (ntfyEndpoint === undefined || ntfyTopic === undefined) throw Error('ntfy data is undefined');

  // redis
  const redisHost = process.env.REDIS_HOST;
  const redisPortStr = process.env.REDIS_PORT;
  const redisPassword = process.env.REDIS_PASSWORD;
  if (redisHost === undefined || redisPortStr === undefined || redisPassword === undefined) {
    throw Error('redis data is undefined');
  }
  const redisPort = parseInt(redisPortStr);
  if (isNaN(redisPort)) throw Error('redisPort is NaN');
  const redis: RedisConfig = {
    host: redisHost,
    port: redisPort,
    password: redisPassword,
  };

  // amqp
  const amqpHost = process.env.AMQP_HOST;
  const amqpPortStr = process.env.AMQP_PORT;
  const qmpHttpPortStr = process.env.AMQP_HTTP_PORT;
  const amqpUsername = process.env.AMQP_USERNAME;
  const amqpPassword = process.env.AMQP_PASSWORD;
  if (
    amqpHost === undefined ||
    amqpPortStr === undefined ||
    qmpHttpPortStr === undefined ||
    amqpUsername === undefined ||
    amqpPassword === undefined
  ) {
    throw Error('amqp data is undefined');
  }
  const amqpPort = parseInt(amqpPortStr);
  if (isNaN(amqpPort)) throw Error('amqpPort is NaN');
  const amqpHttpPort = parseInt(qmpHttpPortStr);
  if (isNaN(amqpHttpPort)) throw Error('amqpHttpPort is NaN');
  const amqp: AmqpConfig = {
    host: amqpHost,
    port: amqpPort,
    httpPort: amqpHttpPort,
    username: amqpUsername,
    password: amqpPassword,
  };

  // postgres
  const pgHost = process.env.PG_HOST;
  const pgPortStr = process.env.PG_PORT;
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
  const pgPort = parseInt(pgPortStr);
  if (isNaN(pgPort)) throw Error('pgPort is NaN');
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
