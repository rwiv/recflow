import { it } from 'vitest';
import { createTestApp } from '../../common/helpers/helper.app.js';
import { LiveStateCleaner } from './live.state.cleaner.js';

const app = await createTestApp();
const cleaner = app.get(LiveStateCleaner);

it('test getTargetIds', async () => {
  const targetIds = await cleaner.getTargetIds();
  console.log(targetIds.length);
  console.log(targetIds);
});

it('test clearLive', async () => {
  const liveId = '';
  await cleaner.clearLive(liveId);
});
