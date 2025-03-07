import { describe, it, beforeEach, afterAll, expect } from 'vitest';
import { dropAll } from '../../infra/db/utils.js';
import { mockNode } from '../../common/helpers/node.mocks.js';
import { notNull } from '../../utils/null.js';
import { NodeUpdater, SyncForm } from './node.updater.js';
import { createTestApp } from '../../common/helpers/helper.app.js';
import { DevInitializer } from '../../common/module/dev-initializer.js';
import { NodeWriter } from './node.writer.js';
import { NodeFinder } from './node.finder.js';
import { NodeGroupRepository } from '../storage/node-group.repository.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';

const app = await createTestApp();
const init = app.get(DevInitializer);
const nodeWriter = app.get(NodeWriter);
const nodeFinder = app.get(NodeFinder);
const nodeUpdater = app.get(NodeUpdater);
const ngRepo = app.get(NodeGroupRepository);
const pfFinder = app.get(PlatformFinder);

describe('ChannelService', () => {
  beforeEach(async () => {
    await init.initDev();
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
    const chzzk = await pfFinder.findByNameNotNull('chzzk');
    const soop = await pfFinder.findByNameNotNull('soop');
    const twitch = await pfFinder.findByNameNotNull('twitch');
    const ng = notNull(await ngRepo.findByName('main'));
    const node1 = await nodeWriter.create(mockNode(1, ng.id));
    const node2 = await nodeWriter.create(mockNode(2, ng.id));

    await Promise.all([
      nodeUpdater.incrementAssignedCnt(node1.id, chzzk.id),
      nodeUpdater.incrementAssignedCnt(node1.id, chzzk.id),
      nodeUpdater.incrementAssignedCnt(node1.id, chzzk.id),
      nodeUpdater.incrementAssignedCnt(node1.id, chzzk.id),
      nodeUpdater.decrementAssignedCnt(node2.id, soop.id),
    ]);
    await print();

    const syncForm: SyncForm = [
      { nodeId: node1.id, pfId: twitch.id },
      { nodeId: node1.id, pfId: twitch.id },
      { nodeId: node1.id, pfId: soop.id },
      { nodeId: node2.id, pfId: chzzk.id },
      { nodeId: node2.id, pfId: twitch.id },
    ];
    await nodeUpdater.synchronize(syncForm);
    // await print();
  });
});

async function print() {
  for (const node of await nodeFinder.findAll(false, true)) {
    const states = notNull(node.states);
    for (const state of states) {
      const pf = await pfFinder.findByIdNotNull(state.platform.id);
      console.log(`${node.name} ${pf.name} ${state.assigned}`);
    }
  }
}
