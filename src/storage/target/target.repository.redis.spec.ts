import { it } from 'vitest';
import { readEnv } from '../../common/env.js';
import { TargetRepositoryRedis } from './target.repository.redis.js';
import { readQueryConfig } from '../../common/query.js';
import { createRedisClient } from '../storage.factory.js';
import { WhcRepository } from '../webhook/whc.repository.js';

const env = readEnv();
const query = readQueryConfig(env.configPath);

it('print', async () => {
  const redis = await createRedisClient(env.redis);
  const repo = new TargetRepositoryRedis(redis, new WhcRepository(redis, query));
  console.log(await repo.keys());
  console.log(await repo.whcMap.getWhcMap());
  const chzzk = await repo.allChzzk();
  console.log(chzzk.map((info) => info.channelName));
  const soop = await repo.allSoop();
  console.log(soop.map((info) => info.channelName));
});

it('clear', async () => {
  const redis = await createRedisClient(env.redis);
  const repo = new TargetRepositoryRedis(redis, new WhcRepository(redis, query));
  await repo.clear();
});
