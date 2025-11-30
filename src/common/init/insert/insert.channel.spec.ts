import { TestingModule } from '@nestjs/testing';
import path from 'path';
import { beforeAll, describe, it } from 'vitest';

import { newTestingModuleRef } from '@/common/helpers/helper.app.js';
import { DevChannelInserter } from '@/common/init/insert/insert.channel.js';

describe.skip('DevChannelInserter', () => {
  let moduleRef: TestingModule;
  let inserter: DevChannelInserter;

  beforeAll(async () => {
    moduleRef = await newTestingModuleRef();
    inserter = moduleRef.get(DevChannelInserter);
  });

  it('writeTestChannelInfosFile', async () => {
    await inserter.writeTestChannelInfosFile(
      path.join('dev', 'batch_conf.yaml'),
      path.join('dev', 'test_channel_infos.json'),
    );
  });
});
