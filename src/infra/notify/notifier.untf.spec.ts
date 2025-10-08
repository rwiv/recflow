import { describe, it } from 'vitest';
import { UntfNotifier } from './notifier.untf.js';
import { readEnv } from '../../common/config/env.js';

describe.skip('UntfNotifier', () => {
  const env = readEnv();

  it('notify', async () => {
    const notifier = new UntfNotifier(env);
    notifier.updateTopic('test');
    notifier.notify('Hello, World!');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
});
