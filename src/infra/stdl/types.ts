import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { z } from 'zod';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { nnint, nonempty } from '../../common/data/common.schema.js';

export interface ChzzkLiveRequest {
  uid: string;
  cookies?: string;
}

export interface SoopLiveRequest {
  userId: string;
  cookies?: string;
}

export interface Stdl {
  requestRecording(nodeEndpoint: string, live: LiveDto, cr?: CriterionDto): Promise<void>;
}

export const stdlStreamStatusEnum = z.enum(['wait', 'recording', 'done', 'failed']);

export const nodeRecorderStatus = z.object({
  platform: platformNameEnum,
  channelId: nonempty,
  liveId: nonempty,
  videoName: nonempty,
  fsName: nonempty,
  num: nnint,
  status: stdlStreamStatusEnum,
  streamUrl: nonempty,
});
export type NodeStatus = z.infer<typeof nodeRecorderStatus>;

export const nodeStatusResponse = z.object({
  recorders: z.array(nodeRecorderStatus),
});
export type NodeStatusResponse = z.infer<typeof nodeStatusResponse>;
