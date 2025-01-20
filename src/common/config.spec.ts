import path from 'node:path';
import { readQueryConfig } from './query.js';

it('test', () => {
  const filePath = path.resolve('..', '..', 'helm', 'conf.yaml');
  const conf = readQueryConfig(filePath);
  console.log(conf);
});
