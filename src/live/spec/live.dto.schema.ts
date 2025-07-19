import { z } from 'zod';
import { liveEnt, liveEntUpdate } from './live.entity.schema.js';
import { channelDto } from '../../channel/spec/channel.dto.schema.js';
import { platformDto } from '../../platform/spec/storage/platform.dto.schema.js';
import { headers, nonempty, queryParams } from '../../common/data/common.schema.js';

export const streamInfo = z.object({
  url: nonempty,
  params: queryParams.nullable(),
  headers: headers,
});
export type StreamInfo = z.infer<typeof streamInfo>;

export const liveDto = liveEnt
  .omit({
    platformId: true,
    channelId: true,
    streamUrl: true,
    streamParams: true,
    streamHeaders: true,
  })
  .extend({
    platform: platformDto,
    channel: channelDto,
    stream: streamInfo.nullable(),
  });
export type LiveDto = z.infer<typeof liveDto>;

export const liveUpdate = liveEntUpdate;
export type LiveUpdate = z.infer<typeof liveUpdate>;
