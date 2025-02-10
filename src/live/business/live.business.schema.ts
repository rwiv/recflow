import { z } from 'zod';
import { liveEnt, liveEntUpdate } from '../persistence/live.persistence.schema.js';
import { platformRecord } from '../../platform/platform.schema.js';
import { nodeRecord } from '../../node/business/node.business.schema.js';
import { channelRecord } from '../../channel/channel/business/channel.business.schema.js';

export const liveRecord = liveEnt.omit({ platformId: true, channelId: true }).extend({
  platform: platformRecord,
  channel: channelRecord,
  node: nodeRecord.optional(),
});
export type LiveRecord = z.infer<typeof liveRecord>;

export const liveUpdate = liveEntUpdate;
export type LiveUpdate = z.infer<typeof liveUpdate>;
