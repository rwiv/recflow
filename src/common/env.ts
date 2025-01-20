import { DEFAULT_NTFY_TOPIC } from './defaults.js';
import { AmqpConfig, RedisConfig } from './configs.js';
import dotenv from 'dotenv';

export interface Env {
  nodeEnv: string;
  configPath: string;
  appPort: number;
  streamqUrl: string;
  streamqQsize: number;
  stdlUrl: string;
  authedUrl: string;
  authedEncKey: string;
  ntfyEndpoint: string | undefined;
  ntfyTopic: string;
  redis: RedisConfig;
  amqp: AmqpConfig;
}

export function readEnv(): Env {
  // NODE_ENV
  let nodeEnv = process.env.NODE_ENV;
  if (nodeEnv !== 'prod') {
    nodeEnv = 'dev';
  }
  if (nodeEnv === 'dev') {
    dotenv.config({ path: 'dev/.env' });
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
  if (streamqUrl === undefined || qsizeStr === undefined)
    throw Error('streamq data is undefined');
  const streamqQsize = parseInt(qsizeStr);
  if (isNaN(streamqQsize)) throw Error('streamqQsize is NaN');

  // stdl
  const stdlUrl = process.env.STDL_URL;
  if (stdlUrl === undefined) throw Error('stdlUrl is undefined');

  // authed
  const authedUrl = process.env.AUTHED_URL;
  const authedEncKey = process.env.AUTHED_ENCKEY;
  if (authedUrl === undefined || authedEncKey === undefined)
    throw Error('authed data is undefined');
  if (authedEncKey.length !== 32) throw new Error('Key must be 32 bytes');

  // ntfy
  const ntfyEndpoint = process.env.NTFY_ENDPOINT;
  const ntfyTopic = process.env.NTFY_TOPIC ?? DEFAULT_NTFY_TOPIC;
  if (ntfyEndpoint === undefined || ntfyTopic === undefined)
    throw Error('ntfy data is undefined');

  // redis
  const redisHost = process.env.REDIS_HOST;
  const redisPortStr = process.env.REDIS_PORT;
  const redisPassword = process.env.REDIS_PASSWORD;
  if (
    redisHost === undefined ||
    redisPortStr === undefined ||
    redisPassword === undefined
  ) {
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
  const amqpUsername = process.env.AMQP_USERNAME;
  const amqpPassword = process.env.AMQP_PASSWORD;
  if (
    amqpHost === undefined ||
    amqpPortStr === undefined ||
    amqpUsername === undefined ||
    amqpPassword === undefined
  ) {
    throw Error('amqp data is undefined');
  }
  const amqpPort = parseInt(amqpPortStr);
  if (isNaN(amqpPort)) throw Error('amqpPort is NaN');
  const amqp: AmqpConfig = {
    host: amqpHost,
    port: amqpPort,
    username: amqpUsername,
    password: amqpPassword,
  };

  return {
    nodeEnv, appPort, configPath,
    streamqUrl, streamqQsize,
    stdlUrl,
    authedUrl, authedEncKey,
    ntfyEndpoint, ntfyTopic,
    redis,
    amqp,
  };
}
