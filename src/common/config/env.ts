import { DEFAULT_UNTF_TOPIC } from '../data/constants.js';
import { AmqpConfig, AuthedConfig, UntfConfig, PostgresConfig, StreamqConfig } from './config.types.js';
import dotenv from 'dotenv';
import { log } from 'jslog';
import path from 'path';
import { parseInteger } from '../../utils/number.js';
import { readAmqpConfig, readPgConfig } from './env.utils.js';

export interface Env {
  nodeEnv: string;
  appPort: number;
  streamq: StreamqConfig;
  authed: AuthedConfig;
  untf: UntfConfig;
  amqp: AmqpConfig;
  pg: PostgresConfig;
  liveRecoveryWaitTimeMs: number;
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
  const streamq: StreamqConfig = { url: streamqUrl, qsize: streamqQsize };

  // authed
  const authedUrl = process.env.AUTHED_URL;
  const authedApiKey = process.env.AUTHED_API_KEY;
  if (authedUrl === undefined || authedApiKey === undefined) throw Error('authed data is undefined');
  const authed: AuthedConfig = { url: authedUrl, apiKey: authedApiKey };

  // untf
  const untfEndpoint = process.env.UNTF_ENDPOINT;
  const untfTopic = process.env.UNTF_TOPIC ?? DEFAULT_UNTF_TOPIC;
  const untfAuthKey = process.env.UNTF_AUTH_KEY;
  if (untfEndpoint === undefined || untfTopic === undefined || untfAuthKey === undefined) {
    throw Error('untf configs are undefined');
  }
  const untf: UntfConfig = { endpoint: untfEndpoint, authKey: untfAuthKey, topic: untfTopic };

  const liveRecoveryWaitTimeMs = parseInteger(
    process.env.LIVE_RECOVERY_WAIT_TIME_MS,
    'liveRecoveryWaitTimeMs',
  );

  return {
    nodeEnv,
    appPort,
    streamq,
    authed,
    untf,
    amqp: readAmqpConfig(),
    pg: readPgConfig(),
    liveRecoveryWaitTimeMs,
  };
}
