import fs from 'fs/promises';
import { it } from 'vitest';
import { readEnv } from '../src/common/config/env';

const env = readEnv();

it('test', async () => {
  const text = await fs.readFile('./dev/test_chzzk.txt', 'utf-8');
  const channelIds = text.split('\n');
  for (const url of channelIds) {
    await req(url);
  }
  console.log('complete');
});

async function req(channelId: string) {
  return fetch(`http://localhost:${env.appPort}/api/chzzk/${channelId}`, {
    method: 'POST',
  });
}
