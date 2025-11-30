import { Inject, Injectable } from '@nestjs/common';
import assert from 'assert';
import { log } from 'jslog';
import { z } from 'zod';

import { ENV } from '@/common/config/config.module.js';
import { Env } from '@/common/config/env.js';

import { Recnode, RecordingStatus } from '@/external/recnode/client/recnode.client.js';

import { nodeDto } from '@/node/spec/node.dto.schema.js';

import { liveDto } from '@/live/spec/live.dto.schema.js';

const FAILURE_CNT_THRESHOLD = 10;
// const FAILURE_ENABLED = true;
const FAILURE_ENABLED = false;

const nodesSchema = z.array(nodeDto);
const livesSchema = z.array(liveDto);

@Injectable()
export class RecnodeFake extends Recnode {
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
        channelId: dto.channel.sourceId,
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
    log.info(`MockRecnodeClient.requestRecording(...)`, { endpoint, record_id: recordId });
    await Promise.resolve(undefined);
  }

  async cancelRecording(endpoint: string, recordId: string): Promise<void> {
    log.info(`MockRecnodeClient.cancel(...)`, { endpoint, record_id: recordId });
    await Promise.resolve(undefined);
  }
}
