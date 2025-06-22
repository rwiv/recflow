import {
  UntfConfig,
  PostgresConfig,
  StreamqConfig,
  VtaskConfig,
  RedisConfig,
  StlinkConfig,
  SQSConfig,
} from './config.types.js';
import dotenv from 'dotenv';
import { log } from 'jslog';
import path from 'path';
import {
  readPgConfig,
  readServerRedisConfig,
  readSQSConfig,
  readStdlRedisMasterConfig,
  readStdlRedisReplicaConfig,
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
  untf: UntfConfig;
  vtask: VtaskConfig;
  pg: PostgresConfig;
  sqs: SQSConfig;
  serverRedis: RedisConfig;
  stdlRedisMaster: RedisConfig;
  stdlRedisReplica: RedisConfig;

  httpTimeout: number;
  liveAllocationInitWaitSec: number;
  liveRecoveryInitWaitSec: number;
  liveFinishTimeoutSec: number;
  nodeResetCycleSec: number;
  nodeFailureThreshold: number;

  liveStateInitWaitSec: number;
  liveStateExpireSec: number;
  stdlClearBatchSize: number;
  cacheExpireSec: number;

  maxConcurrentLive: number;
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
    untf: readUntfConfig(),
    vtask: readVtaskConfig(),
    pg: readPgConfig(),
    sqs: readSQSConfig(),
    serverRedis: readServerRedisConfig(),
    stdlRedisMaster: readStdlRedisMasterConfig(),
    stdlRedisReplica: readStdlRedisReplicaConfig(),

    httpTimeout: nnint.parse(process.env.HTTP_TIMEOUT_MS),
    liveAllocationInitWaitSec: nnint.parse(process.env.LIVE_ALLOCATION_INIT_WAIT_SEC),
    liveRecoveryInitWaitSec: nnint.parse(process.env.LIVE_RECOVERY_INIT_WAIT_SEC),
    liveFinishTimeoutSec: nnint.parse(process.env.LIVE_FINISH_TIMEOUT_SEC),
    nodeResetCycleSec: nnint.parse(process.env.NODE_RESET_CYCLE_SEC),
    nodeFailureThreshold: nnint.parse(process.env.NODE_FAILURE_THRESHOLD),

    liveStateInitWaitSec: nnint.parse(process.env.LIVE_STATE_INIT_WAIT_SEC),
    liveStateExpireSec: nnint.parse(process.env.LIVE_STATE_EXPIRE_SEC),
    stdlClearBatchSize: nnint.parse(process.env.STDL_CLEAR_BATCH_SIZE),
    cacheExpireSec: nnint.parse(process.env.CACHE_EXPIRE_SEC),

    maxConcurrentLive: nnint.parse(process.env.MAX_CONCURRENT_LIVE),
  };
}
