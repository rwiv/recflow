import { db } from './db.js';
import { channelsToTags, channelsV2, tags } from './schema.js';

export async function dropAll() {
  await db.delete(channelsToTags);
  await db.delete(tags);
  await db.delete(channelsV2);
}
