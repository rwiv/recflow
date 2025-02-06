import path from 'path';
import { getChannelServies } from './utils.js';
import { TestChannelInjector } from './injector.js';

const delay = 100;
const filePath = path.join('dev', 'batch_insert.json');

async function main() {
  const { chanWriter } = getChannelServies();
  const injector = new TestChannelInjector(chanWriter);
  await injector.batchInsertChannels(filePath, delay);
}

main();
