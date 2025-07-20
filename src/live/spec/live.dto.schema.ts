import { z } from 'zod';
import {
  liveEnt,
  liveEntUpdate,
  liveStreamEnt,
  liveStreamEntAppend,
  liveStreamEntUpdate,
} from './live.entity.schema.js';
import { channelDto } from '../../channel/spec/channel.dto.schema.js';
import { platformDto } from '../../platform/spec/storage/platform.dto.schema.js';
import { headers, nonempty, queryParams } from '../../common/data/common.schema.js';

export const streamInfo = z.object({
  url: nonempty,
  params: queryParams.nullable(),
  headers: headers,
});
export type StreamInfo = z.infer<typeof streamInfo>;

export const liveStreamDto = liveStreamEnt
  .omit({ channelId: true })
  .extend({ channel: channelDto, params: queryParams.nullable(), headers: headers });
export type LiveStreamDto = z.infer<typeof liveStreamDto>;

export const liveStreamAppend = liveStreamEntAppend;
export type LiveStreamAppend = z.infer<typeof liveStreamAppend>;

export const liveStreamUpdate = liveStreamEntUpdate;
export type LiveStreamUpdate = z.infer<typeof liveStreamUpdate>;

export const liveDto = liveEnt
  .omit({
    platformId: true,
    channelId: true,
  })
  .extend({
    platform: platformDto,
    channel: channelDto,
    stream: liveStreamDto.nullable(),
  });
export type LiveDto = z.infer<typeof liveDto>;

export const liveUpdate = liveEntUpdate;
export type LiveUpdate = z.infer<typeof liveUpdate>;
