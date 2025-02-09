import path from 'path';
import { BatchInserter } from './inserter.js';
import { BatchMigrator } from './migrator.js';
import { BatchRunner } from './runner.js';
import { readTestConf } from '../common/helpers/helper.configs.js';
import { createCustomApp } from '../common/helpers/helper.app.js';
import { AppInitializer } from '../common/module/initializer.js';
import { ChannelWriter } from '../channel/channel/business/channel.writer.js';

async function main() {
  const app = await createCustomApp();
  const init = app.get(AppInitializer);
  const chWriter = app.get(ChannelWriter);

  const inserter = new BatchInserter(chWriter);
  const migrator = new BatchMigrator(chWriter, init);
  const batch = new BatchRunner(migrator, inserter);

  const conf = await readTestConf();
  await batch.backupChannels(path.join('dev', 'batch_backup.json'), conf.endpoint);
  // await batch.migrateChannels(path.join('dev', 'batch_backup.json'));

  // await batch.batchInsertChannels(path.join('dev', 'batch_insert.json'), 100);
}

main().catch(console.log);
