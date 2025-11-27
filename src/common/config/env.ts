import { UntfConfig, PostgresConfig, StreamqConfig, StlinkConfig, SQSConfig } from './config.types.js';
import dotenv from 'dotenv';
import { log } from 'jslog';
import path from 'path';
import {
  readPgConfig,
  readServerRedisConfig,
  readSQSConfig,
  readRecnodeRedisMasterConfig,
  readRecnodeRedisReplicaConfig,
  readStlinkConfig,
  readStreamqConfig,
  readUntfConfig,
} from './env.utils.js';
import { z } from 'zod';
import { RedisConfig } from '../../utils/redis.js';

export const nodeEnvEnum = z.enum(['dev', 'test', 'prod']);
export type NodeEnv = z.infer<typeof nodeEnvEnum>;

export interface Env {
  nodeEnv: NodeEnv;
  appPort: number;
  streamq: StreamqConfig;
  stlink: StlinkConfig;
  untf: UntfConfig;
  pg: PostgresConfig;
  sqs: SQSConfig;
  serverRedis: RedisConfig;

  fsName: string;
  recnodeApiToken: string;
  recnodeDefaultLocation: string;
  recnodeFollowedLocation: string;
  recnodeRedisMaster: RedisConfig;
  recnodeRedisReplica: RedisConfig;

  httpTimeout: number;
  liveAllocationInitWaitSec: number;
  liveRecoveryInitWaitSec: number;
  liveFinishTimeoutSec: number;
  nodeResetCycleSec: number;
  nodeFailureThreshold: number;

  liveStateInitWaitSec: number;
  liveStateExpireSec: number;
  recnodeClearBatchSize: number;
  cacheExpireSec: number;

  maxConcurrentLive: number;
}

const nnint = z.coerce.number().int().nonnegative();
const nonempty = z.string().nonempty();

export function readEnv(): Env {
  if (process.env.NODE_ENV !== 'prod') {
    dotenv.config({ path: path.resolve('dev', '.env') });
    log.debug('dotenv loaded');
  }
  let nodeEnv = process.env.NODE_ENV;
  if (!nodeEnv) {
    nodeEnv = 'dev';
  }

  return {
    nodeEnv: nodeEnvEnum.parse(nodeEnv),
    appPort: nnint.parse(process.env.APP_PORT),
    streamq: readStreamqConfig(),
    stlink: readStlinkConfig(),
    untf: readUntfConfig(),
    pg: readPgConfig(),
    sqs: readSQSConfig(),
    serverRedis: readServerRedisConfig(),

    fsName: nonempty.parse(process.env.FS_NAME),
    recnodeApiToken: nonempty.parse(process.env.STDL_API_TOKEN),
    recnodeDefaultLocation: nonempty.parse(process.env.STDL_DEFAULT_LOCATION),
    recnodeFollowedLocation: nonempty.parse(process.env.STDL_FOLLOWED_LOCATION),
    recnodeRedisMaster: readRecnodeRedisMasterConfig(),
    recnodeRedisReplica: readRecnodeRedisReplicaConfig(),

    httpTimeout: nnint.parse(process.env.HTTP_TIMEOUT_MS),
    liveAllocationInitWaitSec: nnint.parse(process.env.LIVE_ALLOCATION_INIT_WAIT_SEC),
    liveRecoveryInitWaitSec: nnint.parse(process.env.LIVE_RECOVERY_INIT_WAIT_SEC),
    liveFinishTimeoutSec: nnint.parse(process.env.LIVE_FINISH_TIMEOUT_SEC),
    nodeResetCycleSec: nnint.parse(process.env.NODE_RESET_CYCLE_SEC),
    nodeFailureThreshold: nnint.parse(process.env.NODE_FAILURE_THRESHOLD),

    liveStateInitWaitSec: nnint.parse(process.env.LIVE_STATE_INIT_WAIT_SEC),
    liveStateExpireSec: nnint.parse(process.env.LIVE_STATE_EXPIRE_SEC),
    recnodeClearBatchSize: nnint.parse(process.env.STDL_CLEAR_BATCH_SIZE),
    cacheExpireSec: nnint.parse(process.env.CACHE_EXPIRE_SEC),

    maxConcurrentLive: nnint.parse(process.env.MAX_CONCURRENT_LIVE),
  };
}
