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
  readRedisConfig,
  readStlinkConfig,
  readStreamqConfig,
  readUntfConfig,
  readVtaskConfig,
} from './env.utils.js';
import { z } from 'zod';

export interface Env {
  nodeEnv: string;
  appPort: number;
  fsName: string;
  streamq: StreamqConfig;
  stlink: StlinkConfig;
  authed: AuthedConfig;
  untf: UntfConfig;
  vtask: VtaskConfig;
  pg: PostgresConfig;
  stdlRedis: RedisConfig;
  nodeFailureThreshold: number;
  nodeResetCycleSec: number;
  liveRecoveryWaitTimeMs: number;
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

  const appPort = nnint.parse(process.env.APP_PORT);
  const fsName = nonempty.parse(process.env.FS_NAME);

  const liveRecoveryWaitTimeMs = nnint.parse(process.env.LIVE_RECOVERY_WAIT_TIME_MS);
  const nodeFailureThreshold = nnint.parse(process.env.NODE_FAILURE_THRESHOLD);
  const nodeResetCycleSec = nnint.parse(process.env.NODE_RESET_CYCLE_SEC);

  return {
    nodeEnv,
    appPort,
    fsName,
    streamq: readStreamqConfig(),
    stlink: readStlinkConfig(),
    authed: readAuthedConfig(),
    untf: readUntfConfig(),
    vtask: readVtaskConfig(),
    pg: readPgConfig(),
    stdlRedis: readRedisConfig(),
    liveRecoveryWaitTimeMs,
    nodeFailureThreshold,
    nodeResetCycleSec,
  };
}
