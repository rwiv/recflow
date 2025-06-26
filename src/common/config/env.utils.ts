import {
  AmqpConfig,
  PostgresConfig,
  RedisConfig,
  SQSConfig,
  StlinkConfig,
  StreamqConfig,
  UntfConfig,
} from './config.types.js';
import { z } from 'zod';
import { DEFAULT_UNTF_TOPIC } from '../data/constants.js';

const nnint = z.coerce.number().int().nonnegative();

export function readServerRedisConfig(): RedisConfig {
  const host = process.env.SERVER_REDIS_HOST;
  const password = process.env.SERVER_REDIS_PASSWORD;
  if (host === undefined || password === undefined) {
    throw Error('server-redis env is not set');
  }
  const port = nnint.parse(process.env.SERVER_REDIS_PORT);
  return { host, port, password };
}

export function readStdlRedisMasterConfig(): RedisConfig {
  const host = process.env.STDL_REDIS_MASTER_HOST;
  const port = nnint.parse(process.env.STDL_REDIS_MASTER_PORT);
  const password = process.env.STDL_REDIS_PASSWORD;
  if (host === undefined || password === undefined) {
    throw Error('stdl-redis-master env is not set');
  }
  const caPath = process.env.STDL_REDIS_CA_PATH;
  return { host, port, password, caPath };
}

export function readStdlRedisReplicaConfig(): RedisConfig {
  const host = process.env.STDL_REDIS_REPLICA_HOST;
  const port = nnint.parse(process.env.STDL_REDIS_REPLICA_PORT);
  const password = process.env.STDL_REDIS_PASSWORD;
  if (host === undefined || password === undefined) {
    throw Error('stdl-redis-replica env is not set');
  }
  const caPath = process.env.STDL_REDIS_CA_PATH;
  return { host, port, password, caPath };
}

export function readAmqpConfig(): AmqpConfig {
  const host = process.env.AMQP_HOST;
  const username = process.env.AMQP_USERNAME;
  const password = process.env.AMQP_PASSWORD;
  if (host === undefined || username === undefined || password === undefined) {
    throw Error('amqp env is not set');
  }
  const port = nnint.parse(process.env.AMQP_PORT);
  const httpPort = nnint.parse(process.env.AMQP_HTTP_PORT);
  return { host, port, httpPort, username, password };
}

export function readPgConfig(): PostgresConfig {
  const host = process.env.PG_HOST;
  let portStr = process.env.PG_PORT;
  if (process.env.USING_PG_PROD_PORT === 'true') {
    portStr = process.env.PG_PROD_PORT;
  }
  const database = process.env.PG_DATABASE;
  const username = process.env.PG_USERNAME;
  const password = process.env.PG_PASSWORD;
  if (
    host === undefined ||
    portStr === undefined ||
    database === undefined ||
    username === undefined ||
    password === undefined
  ) {
    throw Error('pg env is not set');
  }
  const port = nnint.parse(portStr);
  const url = `postgres://${username}:${password}@${host}:${port}/${database}`;
  return { host, port, database, username, password, url };
}

export function readSQSConfig(): SQSConfig {
  const accessKey = process.env.SQS_ACCESS_KEY;
  const secretKey = process.env.SQS_SECRET_KEY;
  const regionName = process.env.SQS_REGION_NAME;
  const queueUrl = process.env.SQS_QUEUE_URL;
  if (
    accessKey === undefined ||
    secretKey === undefined ||
    regionName === undefined ||
    queueUrl === undefined
  ) {
    throw Error('sqs env is not set');
  }
  return { accessKey, secretKey, regionName, queueUrl };
}

export function readStreamqConfig(): StreamqConfig {
  const url = process.env.STREAMQ_URL;
  if (url === undefined) throw Error('streamq env is not set');
  const qsize = nnint.parse(process.env.STREAMQ_QSIZE);
  return { url, qsize };
}

export function readStlinkConfig(): StlinkConfig {
  const endpoint = process.env.STLINK_ENDPOINT;
  if (endpoint === undefined) throw Error('stlink env is not set');
  const httpTimeoutMs = nnint.parse(process.env.STLINK_HTTP_TIMEOUT_MS);
  return { endpoint, httpTimeoutMs };
}

export function readUntfConfig(): UntfConfig {
  const endpoint = process.env.UNTF_ENDPOINT;
  const topic = process.env.UNTF_TOPIC ?? DEFAULT_UNTF_TOPIC;
  const apiKey = process.env.UNTF_API_KEY;
  if (endpoint === undefined || topic === undefined || apiKey === undefined) {
    throw Error('untf env is not set');
  }
  return { endpoint, apiKey, topic };
}
