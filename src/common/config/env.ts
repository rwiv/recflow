import { DEFAULT_NTFY_TOPIC } from '../data/constants.js';
import { AmqpConfig, PostgresConfig } from './config.types.js';
import dotenv from 'dotenv';
import { log } from 'jslog';
import path from 'path';
import { parseInteger } from '../../utils/number.js';
import { readAmqpConfig, readPgConfig } from './env.utils.js';

export interface Env {
  nodeEnv: string;
  appPort: number;
  streamqUrl: string;
  streamqQsize: number;
  authedUrl: string;
  authedEncKey: string;
  ntfyEndpoint: string;
  ntfyTopic: string;
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

  return {
    nodeEnv,
    appPort,
    streamqUrl,
    streamqQsize,
    authedUrl,
    authedEncKey,
    ntfyEndpoint,
    ntfyTopic,
    amqp: readAmqpConfig(),
    pg: readPgConfig(),
  };
}
