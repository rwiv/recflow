import { TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { notNull } from '@/utils/null.js';

import { newTestingModuleRef } from '@/common/helpers/helper.app.js';
import { DevInitializer } from '@/common/init/dev-initializer.js';

import { dropTables } from '@/infra/db/utils.js';

import { NodeFinder } from '@/node/service/node.finder.js';
import { NodeWriter } from '@/node/service/node.writer.js';
import { dummyNodeAppend } from '@/node/spec/node.dto.schema.dummy.js';
import { NodeGroupRepository } from '@/node/storage/node-group.repository.js';

import { LiveStateCleaner } from '@/live/data/live.state.cleaner.js';

describe.skip('test NodeWriter', () => {
  let moduleRef: TestingModule;
  let init: DevInitializer;
  let nodeWriter: NodeWriter;
  let nodeFinder: NodeFinder;
  let ngRepo: NodeGroupRepository;

  beforeAll(async () => {
    moduleRef = await newTestingModuleRef();
    init = moduleRef.get(DevInitializer);
    nodeWriter = moduleRef.get(NodeWriter);
    nodeFinder = moduleRef.get(NodeWriter);
    ngRepo = moduleRef.get(LiveStateCleaner);
  });

  beforeEach(async () => {
    await init.initDev();
  });

  afterAll(async () => {
    await dropTables();
  });

  it('create', async () => {
    const ng = notNull(await ngRepo.findByName('main'));
    const node = await nodeWriter.create(dummyNodeAppend(), true);
    const found1 = notNull(await nodeFinder.findById(node.id, {}));
    expect(found1.name).eq('node1');

    await nodeWriter.delete(node.id);
    const found2 = await nodeFinder.findById(node.id, {});
    expect(found2).eq(undefined);
  });
});
