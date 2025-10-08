import { describe, it, beforeEach, afterAll, expect, beforeAll } from 'vitest';
import { TestingModule } from '@nestjs/testing';
import { dropTables } from '../../infra/db/utils.js';
import { dummyNodeAppend } from '../spec/node.dto.schema.dummy.js';
import { notNull } from '../../utils/null.js';
import { newTestingModuleRef } from '../../common/helpers/helper.app.js';
import { DevInitializer } from '../../common/init/dev-initializer.js';
import { NodeWriter } from './node.writer.js';
import { NodeFinder } from './node.finder.js';
import { NodeGroupRepository } from '../storage/node-group.repository.js';
import { LiveStateCleaner } from '../../live/data/live.state.cleaner.js';

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
