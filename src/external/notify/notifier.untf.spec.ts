import { beforeAll, describe, it } from 'vitest';

import { readEnv } from '@/common/config/env.js';

import { UntfNotifier } from '@/external/notify/notifier.untf.js';

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
