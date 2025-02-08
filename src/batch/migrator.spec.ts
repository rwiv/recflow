import { it } from 'vitest';
import path from 'path';
import { BatchMigrator } from './migrator.js';
import { getChannelServices } from '../common/helpers/channel.deps.js';
import { readTestConf } from '../common/helpers/common.js';

const { chWriter, init } = getChannelServices();
const migrator = new BatchMigrator(chWriter, init);

it('test', async () => {
  const conf = await readTestConf();
  await migrator.backupChannels(path.join('dev', 'batch_backup.json'), conf.endpoint);
});
