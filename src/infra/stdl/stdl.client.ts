import { z } from 'zod';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { nnint, nonempty, uuid } from '../../common/data/common.schema.js';

export interface Stdl {
  getStatus(endpoint: string): Promise<NodeRecorderStatus[]>;
  startRecording(endpoint: string, recordId: string): Promise<void>;
  cancelRecording(endpoint: string, recordId: string): Promise<void>;
}

export const stdlStreamStatusEnum = z.enum(['wait', 'recording', 'done', 'failed']);

export const nodeRecorderStatus = z.object({
  id: uuid,
  platform: platformNameEnum,
  channelId: nonempty,
  liveId: nonempty,
  videoName: nonempty,
  fsName: nonempty,
  num: nnint,
  status: stdlStreamStatusEnum,
  streamUrl: nonempty,
});
export type NodeRecorderStatus = z.infer<typeof nodeRecorderStatus>;

export const nodeStatusResponse = z.object({
  recorders: z.array(nodeRecorderStatus),
});
export type NodeStatusResponse = z.infer<typeof nodeStatusResponse>;
