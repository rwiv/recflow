import path from 'node:path';
import { readQueryConfig } from './query.js';
import { it } from 'vitest';

it('test', () => {
  const filePath = path.resolve(import.meta.dirname, '..', '..', 'kube', 'app', 'conf.yaml');
  const conf = readQueryConfig(filePath);
  console.log(conf);
});
