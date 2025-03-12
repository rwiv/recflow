import { it } from 'vitest';
import { UntfNotifier } from './notifier.untf.js';
import { readEnv } from '../../common/config/env.js';

it('test', async () => {
  const notifier = new UntfNotifier(readEnv());
  await notifier.notify('test', 'Hello, World!');
});
