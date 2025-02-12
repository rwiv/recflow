import { z } from 'zod';
import { liveEnt, liveEntUpdate } from '../storage/live.entity.schema.js';
import { platformRecord } from '../../platform/storage/platform.business.schema.js';
import { nodeDto } from '../../node/spec/node.dto.schema.js';
import { channelRecord } from '../../channel/channel/business/channel.business.schema.js';

export const liveDto = liveEnt.omit({ platformId: true, channelId: true }).extend({
  platform: platformRecord,
  channel: channelRecord,
  node: nodeDto.optional(),
});
export type LiveDto = z.infer<typeof liveDto>;

export const liveUpdate = liveEntUpdate;
export type LiveUpdate = z.infer<typeof liveUpdate>;
