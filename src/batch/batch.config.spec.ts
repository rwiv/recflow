import { it } from 'vitest';
import path from 'path';
import { readBatchConfig } from './batch.config.js';

it('test', async () => {
  const conf = readBatchConfig(path.join('dev', 'batch_conf.yaml'));
  console.log(conf);
});
