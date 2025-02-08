import { describe, it, beforeEach, afterAll } from 'vitest';
import { getChannelServices } from '../../common/helpers/channel.deps.js';
import { dropAll } from '../../infra/db/utils.js';
import { mockNode } from '../../common/helpers/node.mocks.js';

const { init, nodeService, ngRepo } = getChannelServices();

describe('ChannelService', () => {
  beforeEach(async () => {
    await dropAll();
    await init.checkDb();
  });

  afterAll(async () => {
    await dropAll();
  });

  it('create', async () => {
    const ng = await ngRepo.findByName('main');
    if (!ng) throw new Error('node group not found');
    const node = await nodeService.create(mockNode(1, ng.id), true);
    console.log(node);
  });
});
