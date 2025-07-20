import { Inject, Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { RecordingStatus, Stdl } from './stdl.client.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import assert from 'assert';
import { nodeDto } from '../../node/spec/node.dto.schema.js';
import { liveDto } from '../../live/spec/live.dto.schema.js';
import { z } from 'zod';

const FAILURE_CNT_THRESHOLD = 10;
// const FAILURE_ENABLED = true;
const FAILURE_ENABLED = false;

const nodesSchema = z.array(nodeDto);
const livesSchema = z.array(liveDto);

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

    const nodesUrl = `http://localhost:${this.env.appPort}/api/nodes`;
    const nodes = nodesSchema.parse(
      await (await fetch(nodesUrl, { signal: AbortSignal.timeout(this.env.httpTimeout) })).json(),
    );
    const node = nodes.find((node) => node.endpoint === endpoint);
    assert(node);
    const livesUrl = `http://localhost:${this.env.appPort}/api/lives?nodeId=${node.id}`;
    const lives = livesSchema.parse(
      await (await fetch(livesUrl, { signal: AbortSignal.timeout(this.env.httpTimeout) })).json(),
    );
    assert(lives);
    return lives.map((dto) => {
      return {
        id: dto.id,
        platform: dto.platform.name,
        channelId: dto.channel.pid,
        channelName: dto.channel.username,
        liveId: dto.sourceId,
        videoName: dto.videoName,
        location: 'local',
        fsName: dto.fsName,
        num: 0,
        status: 'recording',
      };
    });
  }

  async getStatusWithStats(endpoint: string): Promise<RecordingStatus[]> {
    return this.getStatus(endpoint);
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
