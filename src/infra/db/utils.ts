import { db } from './db.js';
import { channels, channelsToTags, tags } from '../../channel/persistence/schema.js';

export async function dropAll() {
  await db.delete(channelsToTags);
  await db.delete(tags);
  await db.delete(channels);
}
