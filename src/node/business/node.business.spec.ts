import { describe, it, beforeEach, afterAll, expect } from 'vitest';
import { dropAll } from '../../infra/db/utils.js';
import { mockNode } from '../../common/helpers/node.mocks.js';
import { notNull } from '../../utils/null.js';
import { NodeUpdater, SyncForm } from './node.updater.js';
import { createTestApp } from '../../common/helpers/helper.app.js';
import { AppInitializer } from '../../common/module/initializer.js';
import { NodeWriter } from './node.writer.js';
import { NodeFinder } from './node.finder.js';
import { NodeGroupRepository } from '../persistence/node-group.repository.js';
import { PlatformRepository } from '../../platform/persistence/platform.repository.js';

const app = await createTestApp();
const init = app.get(AppInitializer);
const nodeWriter = app.get(NodeWriter);
const nodeFinder = app.get(NodeFinder);
const nodeUpdater = app.get(NodeUpdater);
const ngRepo = app.get(NodeGroupRepository);
const pfRepo = app.get(PlatformRepository);

describe('ChannelService', async () => {
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
      const pf = notNull(await pfRepo.findById(state.platform.id));
      console.log(`${node.name} ${pf.name} ${state.assigned}`);
    }
  }
}
