import fs from 'fs/promises';
import { it } from 'vitest';
import yaml from 'js-yaml';
import { z } from 'zod';
import path from 'path';
import { readEnv } from '../src/common/config/env.js';
import { StdlImpl } from '../src/infra/stdl/stdl.client.impl.js';

const env = readEnv();
const stdl = new StdlImpl(env);

const recoveryTestConf = z.object({
  liveRecordId: z.string(),
  nodeEndpoints: z.array(z.string()),
});

it('test recovery', async () => {
  const text = await fs.readFile(path.join('dev', 'test', 'recovery_conf.yaml'), 'utf-8');
  const conf = recoveryTestConf.parse(yaml.load(text));
  const ps = conf.nodeEndpoints.map((endpoint) => stdl.cancelRecording(endpoint, conf.liveRecordId));
  await Promise.all(ps);
});
