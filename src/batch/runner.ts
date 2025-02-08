import { BatchMigrator } from './migrator.js';
import { BatchInserter } from './inserter.js';

export class BatchRunner {
  constructor(
    private readonly migrator: BatchMigrator,
    private readonly inserter: BatchInserter,
  ) {}

  migrateChannels(filePath: string) {
    return this.migrator.migrateChannels(filePath);
  }

  backupChannels(filePath: string, endpoint: string) {
    return this.migrator.backupChannels(filePath, endpoint);
  }

  batchInsertChannels(filePath: string, delay: number) {
    return this.inserter.batchInsertChannels(filePath, delay);
  }
}
