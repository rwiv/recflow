import path from 'path';
import { getChannelServices } from '../channel/helpers/utils.js';
import { BatchInserter } from './inserter.js';
import { BatchMigrator } from './migrator.js';
import { BatchRunner } from './runner.js';
import { AppInitializer } from '../common/initializer.js';

async function main() {
  const { pfRepo, cpRepo, chWriter, chFinder } = getChannelServices();
  const initializer = new AppInitializer(pfRepo, cpRepo, chWriter);
  const inserter = new BatchInserter(chWriter);
  const migrator = new BatchMigrator(chFinder, chWriter, initializer);
  const batch = new BatchRunner(migrator, inserter);

  await batch.backupChannels(path.join('dev', 'batch_backup.json'));
  // await batch.migrateChannels(path.join('dev', 'batch_backup.json'));

  // await batch.batchInsertChannels(path.join('dev', 'batch_insert.json'), 100);
}

main().catch(console.log);
