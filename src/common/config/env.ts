import { AmqpConfig, AuthedConfig, UntfConfig, PostgresConfig, StreamqConfig } from './config.types.js';
import dotenv from 'dotenv';
import { log } from 'jslog';
import path from 'path';
import {
  readAmqpConfig,
  readAuthedConfig,
  readPgConfig,
  readStreamqConfig,
  readUntfConfig,
} from './env.utils.js';
import { z } from 'zod';

export interface Env {
  nodeEnv: string;
  appPort: number;
  streamq: StreamqConfig;
  authed: AuthedConfig;
  untf: UntfConfig;
  amqp: AmqpConfig;
  pg: PostgresConfig;
  nodeFailureThreshold: number;
  nodeResetCycleSec: number;
  liveRecoveryWaitTimeMs: number;
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

  const appPort = nnint.parse(process.env.APP_PORT);

  const liveRecoveryWaitTimeMs = nnint.parse(process.env.LIVE_RECOVERY_WAIT_TIME_MS);
  const nodeFailureThreshold = nnint.parse(process.env.NODE_FAILURE_THRESHOLD);
  const nodeResetCycleSec = nnint.parse(process.env.NODE_RESET_CYCLE_SEC);

  return {
    nodeEnv,
    appPort,
    streamq: readStreamqConfig(),
    authed: readAuthedConfig(),
    untf: readUntfConfig(),
    amqp: readAmqpConfig(),
    pg: readPgConfig(),
    liveRecoveryWaitTimeMs,
    nodeFailureThreshold,
    nodeResetCycleSec,
  };
}
