import { readEnv } from './env.js';

it('test', () => {
  const env = readEnv();
  console.log(env.nodeEnv == 'dev');
});
