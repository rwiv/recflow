import { Inject, Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { NodeRecorderStatus, Stdl } from './stdl.client.js';
import { NodeDtoWithLives } from '../../node/spec/node.dto.mapped.schema.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import assert from 'assert';

@Injectable()
export class StdlMock implements Stdl {
  constructor(@Inject(ENV) private readonly env: Env) {}
  async getStatus(endpoint: string): Promise<NodeRecorderStatus[]> {
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

  async startRecording(endpoint: string, recordId: string): Promise<void> {
    log.info(`MockStdlClient.requestRecording(...)`, { endpoint, recordId });
    await Promise.resolve(undefined);
  }

  async cancelRecording(endpoint: string, recordId: string): Promise<void> {
    log.info(`MockStdlClient.cancel(...)`, { endpoint, recordId });
    await Promise.resolve(undefined);
  }
}
