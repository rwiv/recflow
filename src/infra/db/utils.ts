import { db } from './db.js';
import {
  channelsToTags,
  channels,
  channelTags,
  channelPriorities,
  platforms,
  nodeTypes,
  nodeGroups,
  nodes,
  nodeStates,
  lives,
} from './schema.js';

export async function dropAll() {
  await db.delete(lives);

  await db.delete(channelsToTags);
  await db.delete(channelTags);
  await db.delete(channels);
  await db.delete(channelPriorities);

  await db.delete(nodeStates);
  await db.delete(nodes);
  await db.delete(nodeTypes);
  await db.delete(nodeGroups);

  await db.delete(platforms);
}
