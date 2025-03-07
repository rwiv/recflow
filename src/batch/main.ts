import path from 'path';
import { NestFactory } from '@nestjs/core';
import { ChannelBatchInserter } from './insert/insert.channel.js';
import { BatchModule } from './batch.module.js';
import { dropAll } from '../infra/db/utils.js';
import { ChannelBatchMigrator } from './migrate/migrate.channel.js';
import { readBatchConfig } from './batch.config.js';
import { NodeBatchInserter } from './insert/insert.node.js';

async function main() {
  const [cmd] = process.argv.slice(2);
  const app = await NestFactory.create(BatchModule);

  const channelInserter = app.get(ChannelBatchInserter);
  const nodeInserter = app.get(NodeBatchInserter);
  const channelMigrator = app.get(ChannelBatchMigrator);

  const conf = readBatchConfig(path.join('dev', 'batch_conf.yaml'));
  if (cmd === 'backup') {
    await channelMigrator.backup(conf.endpoint, path.join('dev', 'backup', 'batch_backup.txt'));
  } else if (cmd === 'migrate') {
    await channelMigrator.migrate(path.join('dev', 'backup', 'batch_backup.txt'));
  } else if (cmd === 'insert') {
    // await channelInserter.insert(conf.channels, 100);
    await nodeInserter.insert(conf.nodes);
  } else if (cmd === 'drop') {
    await dropAll();
  } else {
    console.log('Invalid command');
  }
}

main().catch(console.log);
