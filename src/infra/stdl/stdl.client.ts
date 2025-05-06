import { z } from 'zod';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { nnint, nonempty, uuid } from '../../common/data/common.schema.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';

export abstract class Stdl {
  abstract getStatus(endpoint: string): Promise<RecorderStatus[]>;

  async findStatus(endpoint: string, liveId: string): Promise<RecorderStatus | null> {
    const recs = (await this.getStatus(endpoint)).filter((status) => status.id === liveId);
    if (recs.length === 0) {
      return null;
    }
    if (recs.length > 1) {
      throw new ValidationError('Multiple recorders found');
    }
    return recs[0];
  }

  async getNodeRecorderStatusListMap(nodes: NodeDto[]): Promise<Map<string, RecorderStatus[]>> {
    const promises: Promise<RecorderStatus[]>[] = [];
    for (const node of nodes) {
      promises.push(this.getStatus(node.endpoint));
    }
    const nodeStatusList: RecorderStatus[][] = await Promise.all(promises);
    if (nodeStatusList.length !== nodes.length) {
      throw new ValidationError('Node status list length mismatch');
    }
    const nodeStatusMap = new Map<string, RecorderStatus[]>();
    for (let i = 0; i < nodeStatusList.length; i++) {
      nodeStatusMap.set(nodes[i].id, nodeStatusList[i]);
    }
    return nodeStatusMap;
  }

  abstract startRecording(endpoint: string, recordId: string): Promise<void>;
  abstract cancelRecording(endpoint: string, recordId: string): Promise<void>;
}

export const stdlStreamStatusEnum = z.enum(['wait', 'recording', 'done', 'failed']);

export const recorderStatus = z.object({
  id: uuid,
  platform: platformNameEnum,
  channelId: nonempty,
  channelName: nonempty,
  liveId: nonempty,
  videoName: nonempty,
  fsName: nonempty,
  num: nnint,
  status: stdlStreamStatusEnum,
});
export type RecorderStatus = z.infer<typeof recorderStatus>;

export const nodeStatusResponse = z.object({
  recorders: z.array(recorderStatus),
});
export type NodeStatusResponse = z.infer<typeof nodeStatusResponse>;
