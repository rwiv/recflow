import { AmqpConfig, PostgresConfig, RedisConfig } from './config.types.js';
import { z } from 'zod';

const nnint = z.coerce.number().int().nonnegative();

export function readRedisConfig(): RedisConfig {
  const redisHost = process.env.REDIS_HOST;
  const redisPassword = process.env.REDIS_PASSWORD;
  const redisPort = nnint.parse(process.env.REDIS_PORT);
  if (redisHost === undefined || redisPassword === undefined) {
    throw Error('redis data is undefined');
  }
  return {
    host: redisHost,
    port: redisPort,
    password: redisPassword,
  };
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
