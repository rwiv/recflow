import { Inject, Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { RecordingStatus, Stdl } from './stdl.client.js';
import { nodeDtoListWithLives } from '../../node/spec/node.dto.mapped.schema.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import assert from 'assert';

const FAILURE_CNT_THRESHOLD = 10;
// const FAILURE_ENABLED = true;
const FAILURE_ENABLED = false;

@Injectable()
export class StdlMock extends Stdl {
  private failureCnt: number = 0;
  constructor(@Inject(ENV) private readonly env: Env) {
    super();
  }

  async getStatus(endpoint: string): Promise<RecordingStatus[]> {
    if (FAILURE_ENABLED) {
      this.failureCnt++;
      if (this.failureCnt >= FAILURE_CNT_THRESHOLD) {
        this.failureCnt = 0;
        return [];
      }
    }

    const url = `http://localhost:${this.env.appPort}/api/nodes`;
    const nodes = nodeDtoListWithLives.parse(
      await (await fetch(url, { signal: AbortSignal.timeout(this.env.httpTimeout) })).json(),
    );
    const node = nodes.find((node) => node.endpoint === endpoint);
    assert(node);
    assert(node.lives);
    return node.lives.map((dto) => {
      return {
        id: dto.id,
        platform: dto.platform.name,
        channelId: dto.channel.pid,
        channelName: dto.channel.username,
        liveId: dto.sourceId,
        videoName: dto.videoName,
        fsName: dto.fsName,
        num: 0,
        status: 'recording',
      };
    });
  }

  async startRecording(endpoint: string, recordId: string): Promise<void> {
    log.info(`MockStdlClient.requestRecording(...)`, { endpoint, record_id: recordId });
    await Promise.resolve(undefined);
  }

  async cancelRecording(endpoint: string, recordId: string): Promise<void> {
    log.info(`MockStdlClient.cancel(...)`, { endpoint, record_id: recordId });
    await Promise.resolve(undefined);
  }
}
