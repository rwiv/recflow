import { readEnv } from './env.js';
import { it } from 'vitest';

it('test', () => {
  const env = readEnv();
  console.log(env);
});
