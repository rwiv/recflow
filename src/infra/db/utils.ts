import { db } from './db.js';
import {channelsToTags, channels, channelTags, channelPriorities, platforms} from './schema.js';

export async function dropAll() {
  await db.delete(channelsToTags);
  await db.delete(channelTags);
  await db.delete(channels);
  await db.delete(channelPriorities);
  await db.delete(platforms);
}
