import { db } from './db.js';
import {
  channelTagMapTable,
  channelTable,
  channelTagTable,
  channelPriorityTable,
  platformTable,
  nodeGroupTable,
  nodeTable,
  liveTable,
  liveCriterionTable,
  liveCriterionRuleTable,
  liveCriterionUnitTable,
  liveNodeTable,
  liveStreamTable,
} from './schema.js';

export async function dropTables() {
  await db.delete(liveCriterionUnitTable);
  await db.delete(liveCriterionRuleTable);
  await db.delete(liveCriterionTable);

  await db.delete(liveNodeTable);
  await db.delete(liveTable);
  await db.delete(liveStreamTable);

  await db.delete(channelTagMapTable);
  await db.delete(channelTagTable);
  await db.delete(channelTable);
  await db.delete(channelPriorityTable);

  await db.delete(nodeTable);
  await db.delete(nodeGroupTable);

  await db.delete(platformTable);
}
