import path from 'path';
import { getChannelServies } from '../channel/helpers/utils.js';
import { BatchInserter } from './inserter.js';
import { BatchMigrator } from './migrator.js';
import { BatchRunner } from './runner.js';

async function main() {
  const { chWriter, chFinder } = getChannelServies();
  const inserter = new BatchInserter(chWriter);
  const migrator = new BatchMigrator(chFinder, chWriter);
  const batch = new BatchRunner(migrator, inserter);

  await batch.backupChannels(path.join('dev', 'batch_backup.json'));
  // await batch.migrateChannels(path.join('dev', 'batch_backup.json'));

  // await batch.batchInsertChannels(path.join('dev', 'batch_insert.json'), 100);
}

main().catch(console.log);
