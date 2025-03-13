import { DEFAULT_UNTF_TOPIC } from '../data/constants.js';
import { AmqpConfig, AuthedConfig, UntfConfig, PostgresConfig, StreamqConfig } from './config.types.js';
import dotenv from 'dotenv';
import { log } from 'jslog';
import path from 'path';
import { readAmqpConfig, readPgConfig } from './env.utils.js';
import { z } from 'zod';

export interface Env {
  nodeEnv: string;
  appPort: number;
  streamq: StreamqConfig;
  authed: AuthedConfig;
  untf: UntfConfig;
  amqp: AmqpConfig;
  pg: PostgresConfig;
  liveRecoveryWaitTimeMs: number;
  nodeFailureThreshold: number;
  nodeResetCycleSec: number;
}

const nnint = z.coerce.number().int().nonnegative();

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
  const appPort = nnint.parse(process.env.APP_PORT);

  // streamq
  const streamqUrl = process.env.STREAMQ_URL;
  if (streamqUrl === undefined) throw Error('streamq data is undefined');
  const streamqQsize = nnint.parse(process.env.STREAMQ_QSIZE);
  const streamq: StreamqConfig = { url: streamqUrl, qsize: streamqQsize };

  // authed
  const authedUrl = process.env.AUTHED_URL;
  const authedApiKey = process.env.AUTHED_API_KEY;
  if (authedUrl === undefined || authedApiKey === undefined) throw Error('authed data is undefined');
  const authed: AuthedConfig = { url: authedUrl, apiKey: authedApiKey };

  // untf
  const untfEndpoint = process.env.UNTF_ENDPOINT;
  const untfTopic = process.env.UNTF_TOPIC ?? DEFAULT_UNTF_TOPIC;
  const untfApiKey = process.env.UNTF_API_KEY;
  if (untfEndpoint === undefined || untfTopic === undefined || untfApiKey === undefined) {
    throw Error('untf configs are undefined');
  }
  const untf: UntfConfig = { endpoint: untfEndpoint, authKey: untfApiKey, topic: untfTopic };

  const liveRecoveryWaitTimeMs = nnint.parse(process.env.LIVE_RECOVERY_WAIT_TIME_MS);
  const nodeFailureThreshold = nnint.parse(process.env.NODE_FAILURE_THRESHOLD);
  const nodeResetCycleSec = nnint.parse(process.env.NODE_RESET_CYCLE_SEC);

  return {
    nodeEnv,
    appPort,
    streamq,
    authed,
    untf,
    amqp: readAmqpConfig(),
    pg: readPgConfig(),
    liveRecoveryWaitTimeMs,
    nodeFailureThreshold,
    nodeResetCycleSec,
  };
}
