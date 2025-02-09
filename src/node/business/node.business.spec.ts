import { describe, it, beforeEach, afterAll, expect } from 'vitest';
import { getChannelServices } from '../../common/helpers/channel.deps.js';
import { dropAll } from '../../infra/db/utils.js';
import { mockNode } from '../../common/helpers/node.mocks.js';
import { notNull } from '../../utils/null.js';
import { SyncForm } from './node.updater.js';

const { init, nodeWriter, nodeUpdater, nodeFinder, ngRepo, pfRepo } = getChannelServices();

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

  it('update', async () => {
    const ng = notNull(await ngRepo.findByName('main'));
    const node1 = await nodeWriter.create(mockNode(1, ng.id));
    const node2 = await nodeWriter.create(mockNode(2, ng.id));

    await Promise.all([
      nodeUpdater.updateCnt(node1.id, 'chzzk', 1),
      nodeUpdater.updateCnt(node2.id, 'soop', 1),
      nodeUpdater.updateCnt(node2.id, 'soop', 1),
      nodeUpdater.updateCnt(node2.id, 'soop', 1),
      nodeUpdater.updateCnt(node2.id, 'soop', -1),
    ]);
    await print();

    const syncForm: SyncForm = [
      { nodeId: node1.id, pfName: 'twitch' },
      { nodeId: node1.id, pfName: 'twitch' },
      { nodeId: node1.id, pfName: 'soop' },
      { nodeId: node2.id, pfName: 'chzzk' },
      { nodeId: node2.id, pfName: 'twitch' },
    ];
    await nodeUpdater.synchronize(syncForm);
    // await print();
  });
});

async function print() {
  for (const node of await nodeFinder.findAll(false, true)) {
    const states = notNull(node.states);
    for (const state of states) {
      const pf = notNull(await pfRepo.findById(state.platformId));
      console.log(`${node.name} ${pf.name} ${state.assigned}`);
    }
  }
}
