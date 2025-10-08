import fs from 'fs/promises';
import { describe, it, beforeAll } from 'vitest';
import { readEnv, Env } from '../src/common/config/env.js';

describe.skip('app api', () => {
  let env: Env;

  beforeAll(() => {
    env = readEnv();
  });

  it('request channels', async () => {
    const text = await fs.readFile('./dev/test_chzzk.txt', 'utf-8');
    const channelIds = text.split('\n');
    for (const channelId of channelIds) {
      await fetch(`http://localhost:${env.appPort}/api/chzzk/${channelId}`, { method: 'POST' });
    }
    console.log('complete');
  });
});
