import { it } from 'vitest';
import { UntfNotifier } from './notifier.untf.js';
import { readEnv } from '../../common/config/env.js';

it('test', async () => {
  const notifier = new UntfNotifier(readEnv());
  notifier.updateTopic('test');
  notifier.notify('Hello, World!');
  await new Promise((resolve) => setTimeout(resolve, 1000));
});
