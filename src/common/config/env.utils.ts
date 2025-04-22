import {
  AmqpConfig,
  AuthedConfig,
  PostgresConfig,
  RedisConfig,
  StreamqConfig,
  UntfConfig,
  VtaskConfig,
} from './config.types.js';
import { z } from 'zod';
import { DEFAULT_UNTF_TOPIC } from '../data/constants.js';

const nnint = z.coerce.number().int().nonnegative();

export function readRedisConfig(): RedisConfig {
  const host = process.env.STDL_REDIS_HOST;
  const password = process.env.STDL_REDIS_PASSWORD;
  if (host === undefined || password === undefined) {
    throw Error('redis data is undefined');
  }
  const port = nnint.parse(process.env.STDL_REDIS_PORT);
  const caPath = process.env.STDL_REDIS_CA_PATH;
  return { host, port, password, caPath };
}

export function readAmqpConfig(): AmqpConfig {
  const amqpHost = process.env.AMQP_HOST;
  const amqpUsername = process.env.AMQP_USERNAME;
  const amqpPassword = process.env.AMQP_PASSWORD;
  if (amqpHost === undefined || amqpUsername === undefined || amqpPassword === undefined) {
    throw Error('amqp data is undefined');
  }
  const amqpPort = nnint.parse(process.env.AMQP_PORT);
  const amqpHttpPort = nnint.parse(process.env.AMQP_HTTP_PORT);
  return {
    host: amqpHost,
    port: amqpPort,
    httpPort: amqpHttpPort,
    username: amqpUsername,
    password: amqpPassword,
  };
}

export function readPgConfig(): PostgresConfig {
  const pgHost = process.env.PG_HOST;
  let pgPortStr = process.env.PG_PORT;
  if (process.env.USING_PG_PROD_PORT === 'true') {
    pgPortStr = process.env.PG_PROD_PORT;
  }
  const pgDatabase = process.env.PG_DATABASE;
  const pgUsername = process.env.PG_USERNAME;
  const pgPassword = process.env.PG_PASSWORD;
  if (
    pgHost === undefined ||
    pgPortStr === undefined ||
    pgDatabase === undefined ||
    pgUsername === undefined ||
    pgPassword === undefined
  ) {
    throw Error('pg data is undefined');
  }
  const pgPort = nnint.parse(pgPortStr);
  const url = `postgres://${pgUsername}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}`;
  return {
    host: pgHost,
    port: pgPort,
    database: pgDatabase,
    username: pgUsername,
    password: pgPassword,
    url,
  };
}

export function readStreamqConfig(): StreamqConfig {
  const url = process.env.STREAMQ_URL;
  if (url === undefined) throw Error('streamq data is undefined');
  const qsize = nnint.parse(process.env.STREAMQ_QSIZE);
  return { url, qsize };
}

export function readAuthedConfig(): AuthedConfig {
  const url = process.env.AUTHED_URL;
  const apiKey = process.env.AUTHED_API_KEY;
  if (url === undefined || apiKey === undefined) throw Error('authed data is undefined');
  return { url, apiKey };
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
