import path from 'path';
import { getChannelServies } from '../channel/helpers/utils.js';
import { BatchRunner } from './batch.runner.js';

const delay = 100;
const filePath = path.join('dev', 'batch_insert.json');

async function main() {
  process.env.USING_PG_PROD_PORT = 'true';

  const { chanWriter } = getChannelServies();
  const batch = new BatchRunner(chanWriter);
  await batch.batchInsertChannels(filePath, delay);
}

main().catch(console.log);
