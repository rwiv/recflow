import {
  AuthedConfig,
  UntfConfig,
  PostgresConfig,
  StreamqConfig,
  VtaskConfig,
  RedisConfig,
  StlinkConfig,
} from './config.types.js';
import dotenv from 'dotenv';
import { log } from 'jslog';
import path from 'path';
import {
  readAuthedConfig,
  readPgConfig,
  readServerRedisConfig,
  readStdlRedisConfig,
  readStlinkConfig,
  readStreamqConfig,
  readUntfConfig,
  readVtaskConfig,
} from './env.utils.js';
import { z } from 'zod';

export interface Env {
  nodeEnv: string;
  appPort: number;
  appEndpoint: string;
  fsName: string;
  streamq: StreamqConfig;
  stlink: StlinkConfig;
  authed: AuthedConfig;
  untf: UntfConfig;
  vtask: VtaskConfig;
  pg: PostgresConfig;
  serverRedis: RedisConfig;
  stdlRedis: RedisConfig;
  httpTimeout: number;
  nodeFailureThreshold: number;
  nodeResetCycleSec: number;
  liveRecoveryWaitTimeMs: number;
  liveClearBatchSize: number;
}

const nnint = z.coerce.number().int().nonnegative();
const nonempty = z.string().nonempty();

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

  return {
    nodeEnv,
    appPort: nnint.parse(process.env.APP_PORT),
    appEndpoint: nonempty.parse(process.env.APP_ENDPOINT),
    fsName: nonempty.parse(process.env.FS_NAME),
    streamq: readStreamqConfig(),
    stlink: readStlinkConfig(),
    authed: readAuthedConfig(),
    untf: readUntfConfig(),
    vtask: readVtaskConfig(),
    pg: readPgConfig(),
    serverRedis: readServerRedisConfig(),
    stdlRedis: readStdlRedisConfig(),
    httpTimeout: nnint.parse(process.env.HTTP_TIMEOUT_MS),
    liveRecoveryWaitTimeMs: nnint.parse(process.env.LIVE_RECOVERY_WAIT_TIME_MS),
    nodeFailureThreshold: nnint.parse(process.env.NODE_FAILURE_THRESHOLD),
    nodeResetCycleSec: nnint.parse(process.env.NODE_RESET_CYCLE_SEC),
    liveClearBatchSize: nnint.parse(process.env.LIVE_CLEAR_BATCH_SIZE),
  };
}
