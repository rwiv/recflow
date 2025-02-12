import { it } from 'vitest';
import path from 'path';
import { ChannelBatchMigrator } from './migrate.channel.js';
import { createTestApp } from '../../common/helpers/helper.app.js';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { readBatchConfig } from '../batch.config.js';

const app = await createTestApp();
const chWriter = app.get(ChannelWriter);
const conf = readBatchConfig(path.join('dev', 'batch_conf.yaml'));

it('test', async () => {
  console.log(conf.endpoint);
  const migrator = new ChannelBatchMigrator(chWriter);
  const result = await migrator.fetchChannels(conf.endpoint, 1, 10);
  console.log(result.channels[0]);
});
