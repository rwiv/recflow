import { describe, it, beforeAll } from 'vitest';
import { UntfNotifier } from './notifier.untf.js';
import { readEnv } from '../../common/config/env.js';

describe.skip('UntfNotifier', () => {
  let notifier: UntfNotifier;

  beforeAll(() => {
    notifier = new UntfNotifier(readEnv());
  });

  it('notify', async () => {
    notifier.updateTopic('test');
    notifier.notify('Hello, World!');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
});
