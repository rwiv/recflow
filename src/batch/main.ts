import path from 'path';
import { NestFactory } from '@nestjs/core';
import { BatchInserter } from './insert/inserter.js';
import { readTestConf } from '../common/helpers/helper.configs.js';
import { BatchModule } from './batch.module.js';
import { dropAll } from '../infra/db/utils.js';
import { ChannelBatchMigrator } from './migrate/migrate.channel.js';
import { AppInitializer } from '../common/module/initializer.js';

async function main() {
  const [cmd] = process.argv.slice(2);
  const app = await NestFactory.create(BatchModule);

  const init = app.get(AppInitializer);
  const inserter = app.get(BatchInserter);
  const migrator = app.get(ChannelBatchMigrator);

  const conf = await readTestConf();
  if (cmd === 'backup') {
    await migrator.backup(conf.endpoint, path.join('dev', 'backup', 'batch_backup.txt'));
  } else if (cmd === 'migrate') {
    await init.checkDb(); // TODO: remove
    await migrator.migrate(path.join('dev', 'backup', 'batch_backup.txt'));
  } else if (cmd === 'insert') {
    await inserter.batchInsertChannels(path.join('dev', 'batch_insert.json'), 100);
  } else if (cmd === 'drop') {
    await dropAll();
  } else {
    console.log('Invalid command');
  }
}

main().catch(console.log);
