import { Inject, Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { RecorderStatus, Stdl } from './stdl.client.js';
import { NodeDtoWithLives } from '../../node/spec/node.dto.mapped.schema.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import assert from 'assert';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';

const FAILURE_CNT_THRESHOLD = 10;
// const FAILURE_ENABLED = true;
const FAILURE_ENABLED = false;

@Injectable()
export class StdlMock extends Stdl {
  private failureCnt: number = 0;
  constructor(@Inject(ENV) private readonly env: Env) {
    super();
  }

  async getStatus(endpoint: string): Promise<RecorderStatus[]> {
    if (FAILURE_ENABLED) {
      this.failureCnt++;
      if (this.failureCnt >= FAILURE_CNT_THRESHOLD) {
        this.failureCnt = 0;
        return [];
      }
    }

    const url = `http://localhost:${this.env.appPort}/api/nodes`;
    const nodes = (await (await fetch(url)).json()) as NodeDtoWithLives[];
    const node = nodes.find((node) => node.endpoint === endpoint);
    assert(node);
    assert(node.lives);
    return node.lives.map((dto) => {
      assert(dto.streamUrl);
      return {
        id: dto.id,
        platform: dto.platform.name,
        channelId: dto.channel.pid,
        liveId: dto.sourceId,
        videoName: dto.videoName,
        fsName: 'local',
        num: 0,
        status: 'recording',
        streamUrl: dto.streamUrl,
      };
    });
  }

  async getNodeRecorderStatusListMap(nodes: NodeDto[]): Promise<Map<string, RecorderStatus[]>> {
    const promises = [];
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

  async startRecording(endpoint: string, recordId: string): Promise<void> {
    log.info(`MockStdlClient.requestRecording(...)`, { endpoint, recordId });
    await Promise.resolve(undefined);
  }

  async cancelRecording(endpoint: string, recordId: string): Promise<void> {
    log.info(`MockStdlClient.cancel(...)`, { endpoint, recordId });
    await Promise.resolve(undefined);
  }
}
