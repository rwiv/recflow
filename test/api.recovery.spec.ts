import fs from 'fs/promises';
import { describe, it, beforeAll } from 'vitest';
import yaml from 'js-yaml';
import { z } from 'zod';
import path from 'path';
import { readEnv, Env } from '../src/common/config/env.js';
import { StdlImpl } from '../src/external/stdl/client/stdl.client.impl.js';
import { StdlRedisImpl } from '../src/external/stdl/redis/stdl.redis.impl.js';
import { createRedisClient } from '../src/infra/redis/redis.client.js';

const recoveryTestConf = z.object({
  liveRecordId: z.string(),
  nodeEndpoints: z.array(z.string()),
});

describe.skip('recovery api', () => {
  let env: Env;
  let stdl: StdlImpl;

  beforeAll(() => {
    env = readEnv();
    stdl = new StdlImpl(env);
  });

  it('recovery', async () => {
    const text = await fs.readFile(path.join('dev', 'test', 'recovery_conf.yaml'), 'utf-8');
    const conf = recoveryTestConf.parse(yaml.load(text));
    const ps = conf.nodeEndpoints.map((endpoint) => stdl.cancelRecording(endpoint, conf.liveRecordId));
    await Promise.all(ps);
  });

  it('recovery (invalid)', async () => {
    const text = await fs.readFile(path.join('dev', 'test', 'recovery_conf.yaml'), 'utf-8');
    const conf = recoveryTestConf.parse(yaml.load(text));

    const master = await createRedisClient(env.stdlRedisMaster);
    const replica = await createRedisClient(env.stdlRedisReplica);
    const stdlRedis = new StdlRedisImpl(master, replica, 3600 * 24, 'local', 'local', 'none');

    await stdlRedis.updateIsInvalid(conf.liveRecordId, true);

    const ps = conf.nodeEndpoints.map((endpoint) => stdl.cancelRecording(endpoint, conf.liveRecordId));
    await Promise.all(ps);
  });
});
