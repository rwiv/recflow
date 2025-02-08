import path from 'path';
import { getChannelServices } from '../channel/helpers/utils.js';
import { BatchInserter } from './inserter.js';
import { BatchMigrator } from './migrator.js';
import { BatchRunner } from './runner.js';
import { readTestConf } from '../common/helpers.js';

async function main() {
  const { chWriter, init } = getChannelServices();
  const inserter = new BatchInserter(chWriter);
  const migrator = new BatchMigrator(chWriter, init);
  const batch = new BatchRunner(migrator, inserter);

  const conf = await readTestConf();
  await batch.backupChannels(path.join('dev', 'batch_backup.json'), conf.endpoint);
  // await batch.migrateChannels(path.join('dev', 'batch_backup.json'));

  // await batch.batchInsertChannels(path.join('dev', 'batch_insert.json'), 100);
}

main().catch(console.log);
