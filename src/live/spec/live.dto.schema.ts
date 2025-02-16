import { z } from 'zod';
import { liveEnt, liveEntUpdate } from './live.entity.schema.js';
import { nodeDto } from '../../node/spec/node.dto.schema.js';
import { channelDto } from '../../channel/spec/channel.dto.schema.js';
import { platformDto } from '../../platform/spec/storage/platform.dto.schema.js';

export const liveDto = liveEnt.omit({ platformId: true, channelId: true }).extend({
  platform: platformDto,
  channel: channelDto,
  node: nodeDto.optional(),
});
export type LiveDto = z.infer<typeof liveDto>;

export const liveUpdate = liveEntUpdate;
export type LiveUpdate = z.infer<typeof liveUpdate>;
