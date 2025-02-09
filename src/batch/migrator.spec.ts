import { it } from 'vitest';
import path from 'path';
import { BatchMigrator } from './migrator.js';
import { readTestConf } from '../common/helpers/helper.configs.js';
import { createTestApp } from '../common/helpers/helper.app.js';
import { AppInitializer } from '../common/module/initializer.js';
import { ChannelWriter } from '../channel/channel/business/channel.writer.js';

const app = await createTestApp();
const init = app.get(AppInitializer);
const chWriter = app.get(ChannelWriter);
const migrator = new BatchMigrator(chWriter, init);

it('test', async () => {
  const conf = await readTestConf();
  await migrator.backupChannels(path.join('dev', 'batch_backup.json'), conf.endpoint);
});
