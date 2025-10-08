import { describe, it } from 'vitest';
import path from 'path';
import { createTestApp } from '../../helpers/helper.app.js';
import { DevChannelInserter } from './insert.channel.js';

describe.skip('DevChannelInserter', async () => {
  const app = await createTestApp();
  const inserter = app.get(DevChannelInserter);

  it('writeTestChannelInfosFile', async () => {
    await inserter.writeTestChannelInfosFile(
      path.join('dev', 'batch_conf.yaml'),
      path.join('dev', 'test_channel_infos.json'),
    );
  });
});
