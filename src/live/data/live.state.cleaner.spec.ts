import { beforeAll, describe, it } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { newTestingModuleRef } from '../../common/helpers/helper.app.js';
import { LiveStateCleaner } from './live.state.cleaner.js';

describe.skip('LiveStateCleaner', () => {
  let moduleRef: TestingModule;
  let cleaner: LiveStateCleaner;

  beforeAll(async () => {
    moduleRef = await newTestingModuleRef();
    cleaner = moduleRef.get(LiveStateCleaner);
  });

  it('test getTargetIds', async () => {
    const targetIds = await cleaner.getTargetIds();
    console.log(targetIds.length);
    console.log(targetIds);
  });

  it('test clearLive', async () => {
    const liveId = '';
    await cleaner.clearLive(liveId);
  });
});
