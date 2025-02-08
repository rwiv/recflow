import { describe, it, beforeEach, afterAll, expect } from 'vitest';
import { getChannelServices } from '../../common/helpers/channel.deps.js';
import { dropAll } from '../../infra/db/utils.js';
import { mockNode } from '../../common/helpers/node.mocks.js';
import { notNull } from '../../utils/null.js';

const { init, nodeWriter, nodeFinder, ngRepo } = getChannelServices();

describe('ChannelService', () => {
  beforeEach(async () => {
    await dropAll();
    await init.checkDb();
  });

  afterAll(async () => {
    await dropAll();
  });

  it('create', async () => {
    const ng = notNull(await ngRepo.findByName('main'));
    const node = await nodeWriter.create(mockNode(1, ng.id), true);
    const found1 = notNull(await nodeFinder.findById(node.id));
    expect(found1.name).eq('node1');

    await nodeWriter.delete(node.id);
    const found2 = await nodeFinder.findById(node.id);
    expect(found2).eq(undefined);
  });
});
