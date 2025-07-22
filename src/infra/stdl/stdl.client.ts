import { z } from 'zod';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { nnint, nonempty, uuid } from '../../common/data/common.schema.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { stdlLocationType } from './stdl.types.js';

export abstract class Stdl {
  abstract getStatus(endpoint: string): Promise<RecordingStatus[]>;
  abstract getStatusWithStats(endpoint: string): Promise<RecordingStatus[]>;

  async findStatus(endpoint: string, liveId: string): Promise<RecordingStatus | null> {
    const recs = (await this.getStatus(endpoint)).filter((status) => status.id === liveId);
    if (recs.length === 0) {
      return null;
    }
    if (recs.length > 1) {
      throw new ValidationError('Multiple recordings found');
    }
    return recs[0];
  }

  async getNodeRecorderStatusListMap(nodes: NodeDto[]): Promise<Map<string, RecordingStatus[]>> {
    const promises = nodes.map((node) => this.getStatus(node.endpoint));
    const nodeStatusList: RecordingStatus[][] = await Promise.all(promises);
    if (nodeStatusList.length !== nodes.length) {
      throw new ValidationError('Node status list length mismatch');
    }
    const nodeStatusMap = new Map<string, RecordingStatus[]>();
    for (let i = 0; i < nodeStatusList.length; i++) {
      nodeStatusMap.set(nodes[i].id, nodeStatusList[i]);
    }
    return nodeStatusMap;
  }

  abstract startRecording(endpoint: string, recordId: string): Promise<void>;
  abstract cancelRecording(endpoint: string, recordId: string): Promise<void>;
}

export const stdlStreamStatusEnum = z.enum(['waiting', 'recording', 'completed', 'failed']);

export const recordingStatus = z.object({
  id: uuid,
  platform: platformNameEnum,
  channelId: nonempty,
  channelName: nonempty,
  liveId: nonempty,
  videoName: nonempty,
  fsName: nonempty,
  num: nnint,
  location: stdlLocationType,
  status: stdlStreamStatusEnum,
  stats: z.any().optional(),
});
export type RecordingStatus = z.infer<typeof recordingStatus>;

export const nodeStatusResponse = z.object({
  recordings: z.array(recordingStatus),
});
export type NodeStatusResponse = z.infer<typeof nodeStatusResponse>;
