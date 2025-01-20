import { it } from 'vitest';
import { readEnv } from '../common/env.js';
import { TargetRepositoryRedis } from './target-repository.redis.js';
import { readQueryConfig } from '../common/query.js';

const env = readEnv();
const query = readQueryConfig(env.configPath);
const repo = new TargetRepositoryRedis(env, query);

it('print', async () => {
  await repo.init();
  console.log(await repo.keys());
  console.log(await repo.getWhcMap());
  const chzzk = await repo.allChzzk();
  console.log(chzzk.map((info) => info.channelName));
  const soop = await repo.allSoop();
  console.log(soop.map((info) => info.channelName));
});

it('clear', async () => {
  await repo.init();
  await repo.clear();
});
