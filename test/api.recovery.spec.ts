import fs from 'fs/promises';
import yaml from 'js-yaml';
import path from 'path';
import { beforeAll, describe, it } from 'vitest';
import { z } from 'zod';

import { Env, readEnv } from '../src/common/config/env.js';
import { RecnodeImpl } from '../src/external/recnode/client/recnode.client.impl.js';
import { RecnodeRedisImpl } from '../src/external/recnode/redis/recnode.redis.impl.js';
import { createRedisClient } from '../src/utils/redis.js';

const recoveryTestConf = z.object({
  liveRecordId: z.string(),
  nodeEndpoints: z.array(z.string()),
});

describe.skip('recovery api', () => {
  let env: Env;
  let recnode: RecnodeImpl;

  beforeAll(() => {
    env = readEnv();
    recnode = new RecnodeImpl(env);
  });

  it('recovery', async () => {
    const text = await fs.readFile(path.join('dev', 'test', 'recovery_conf.yaml'), 'utf-8');
    const conf = recoveryTestConf.parse(yaml.load(text));
    const ps = conf.nodeEndpoints.map((endpoint) => recnode.cancelRecording(endpoint, conf.liveRecordId));
    await Promise.all(ps);
  });

  it('recovery (invalid)', async () => {
    const text = await fs.readFile(path.join('dev', 'test', 'recovery_conf.yaml'), 'utf-8');
    const conf = recoveryTestConf.parse(yaml.load(text));

    const master = await createRedisClient(env.recnodeRedisMaster);
    const replica = await createRedisClient(env.recnodeRedisReplica);
    const recnodeRedis = new RecnodeRedisImpl(master, replica, 3600 * 24, 'local', 'local');

    await recnodeRedis.updateIsInvalid(conf.liveRecordId, true);

    const ps = conf.nodeEndpoints.map((endpoint) => recnode.cancelRecording(endpoint, conf.liveRecordId));
    await Promise.all(ps);
  });
});
