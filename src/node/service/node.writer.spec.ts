import { describe, it, beforeEach, afterAll, expect } from 'vitest';
import { dropTables } from '../../infra/db/utils.js';
import { dummyNodeAppend } from '../spec/node.dto.schema.dummy.js';
import { notNull } from '../../utils/null.js';
import { createTestApp } from '../../common/helpers/helper.app.js';
import { DevInitializer } from '../../common/init/dev-initializer.js';
import { NodeWriter } from './node.writer.js';
import { NodeFinder } from './node.finder.js';
import { NodeGroupRepository } from '../storage/node-group.repository.js';

const app = await createTestApp();
const init = app.get(DevInitializer);
const nodeWriter = app.get(NodeWriter);
const nodeFinder = app.get(NodeFinder);
const ngRepo = app.get(NodeGroupRepository);

describe('test NodeWriter', async () => {
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
