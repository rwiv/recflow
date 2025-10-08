import {
  channelTagMapTable,
  channelTable,
  channelTagTable,
  channelGradeTable,
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
import { drizzle } from 'drizzle-orm/node-postgres';
import { readEnv } from '../../common/config/env.js';

export async function dropTables() {
  const db = drizzle(readEnv().pg.url);

  await db.delete(liveCriterionUnitTable);
  await db.delete(liveCriterionRuleTable);
  await db.delete(liveCriterionTable);

  await db.delete(liveNodeTable);
  await db.delete(liveTable);
  await db.delete(liveStreamTable);

  await db.delete(channelTagMapTable);
  await db.delete(channelTagTable);
  await db.delete(channelTable);
  await db.delete(channelGradeTable);

  await db.delete(nodeTable);
  await db.delete(nodeGroupTable);

  await db.delete(platformTable);
}
