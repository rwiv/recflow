import {
  AmqpConfig,
  PostgresConfig,
  RedisConfig,
  StlinkConfig,
  StreamqConfig,
  UntfConfig,
  VtaskConfig,
} from './config.types.js';
import { z } from 'zod';
import { DEFAULT_UNTF_TOPIC } from '../data/constants.js';

const nnint = z.coerce.number().int().nonnegative();

export function readServerRedisConfig(): RedisConfig {
  const host = process.env.SERVER_REDIS_HOST;
  const password = process.env.SERVER_REDIS_PASSWORD;
  if (host === undefined || password === undefined) {
    throw Error('redis data is undefined');
  }
  const port = nnint.parse(process.env.SERVER_REDIS_PORT);
  return { host, port, password };
}

export function readStdlRedisMasterConfig(): RedisConfig {
  const host = process.env.STDL_REDIS_MASTER_HOST;
  const port = nnint.parse(process.env.STDL_REDIS_MASTER_PORT);
  const password = process.env.STDL_REDIS_PASSWORD;
  if (host === undefined || password === undefined) {
    throw Error('redis data is undefined');
  }
  const caPath = process.env.STDL_REDIS_CA_PATH;
  return { host, port, password, caPath };
}

export function readStdlRedisReplicaConfig(): RedisConfig {
  const host = process.env.STDL_REDIS_REPLICA_HOST;
  const port = nnint.parse(process.env.STDL_REDIS_REPLICA_PORT);
  const password = process.env.STDL_REDIS_PASSWORD;
  if (host === undefined || password === undefined) {
    throw Error('redis data is undefined');
  }
  const caPath = process.env.STDL_REDIS_CA_PATH;
  return { host, port, password, caPath };
}

export function readAmqpConfig(): AmqpConfig {
  const host = process.env.AMQP_HOST;
  const username = process.env.AMQP_USERNAME;
  const password = process.env.AMQP_PASSWORD;
  if (host === undefined || username === undefined || password === undefined) {
    throw Error('amqp data is undefined');
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
    throw Error('pg data is undefined');
  }
  const port = nnint.parse(portStr);
  const url = `postgres://${username}:${password}@${host}:${port}/${database}`;
  return { host, port, database, username, password, url };
}

export function readStreamqConfig(): StreamqConfig {
  const url = process.env.STREAMQ_URL;
  if (url === undefined) throw Error('streamq data is undefined');
  const qsize = nnint.parse(process.env.STREAMQ_QSIZE);
  return { url, qsize };
}

export function readStlinkConfig(): StlinkConfig {
  const endpoint = process.env.STLINK_ENDPOINT;
  if (endpoint === undefined) throw Error('stlink data is undefined');
  return { endpoint };
}

export function readUntfConfig(): UntfConfig {
  const endpoint = process.env.UNTF_ENDPOINT;
  const topic = process.env.UNTF_TOPIC ?? DEFAULT_UNTF_TOPIC;
  const apiKey = process.env.UNTF_API_KEY;
  if (endpoint === undefined || topic === undefined || apiKey === undefined) {
    throw Error('untf configs are undefined');
  }
  return { endpoint, apiKey, topic };
}

export function readVtaskConfig(): VtaskConfig {
  const endpoint = process.env.VTASK_ENDPOINT;
  if (endpoint === undefined) throw Error('vtask url is undefined');
  return { endpoint };
}
