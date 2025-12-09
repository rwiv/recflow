import { Injectable } from '@nestjs/common';

import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';

import { db } from '@/infra/db/db.js';
import { Tx } from '@/infra/db/types.js';

import { PlatformFinder } from '@/platform/storage/platform.finder.js';

import { ChannelFinder } from '@/channel/service/channel.finder.js';

import { NodeFinder } from '@/node/service/node.finder.js';
import { NodeFieldsReq } from '@/node/spec/node.dto.schema.js';

import { LiveStreamDto } from '@/live/spec/live.dto.schema.js';
import { LiveDtoMapped } from '@/live/spec/live.dto.schema.mapped.js';
import { LiveEnt, LiveStatus, isDisableRequested, isFinished } from '@/live/spec/live.entity.schema.js';
import { LiveStreamService } from '@/live/stream/live-stream.service.js';

export interface LiveFieldsReq {
  nodes?: boolean;
  nodeGroup?: boolean;
}

@Injectable()
export class LiveMapper {
  constructor(
    private readonly pfFinder: PlatformFinder,
    private readonly channelFinder: ChannelFinder,
    private readonly nodeFinder: NodeFinder,
    private readonly streamService: LiveStreamService,
  ) {}

  async mapAll(lives: LiveEnt[], tx: Tx = db, opt: LiveFieldsReq): Promise<LiveDtoMapped[]> {
    const promises = lives.map((live) => this.map(live, tx, opt));
    return Promise.all(promises);
  }

  async map(liveEnt: LiveEnt, tx: Tx = db, opt: LiveFieldsReq = {}): Promise<LiveDtoMapped> {
    const platformP = this.pfFinder.findByIdNotNull(liveEnt.platformId, tx);
    const channelP = this.channelFinder.findById(liveEnt.channelId, tx);
    const platform = await platformP;
    const channel = await channelP;
    if (!channel) throw NotFoundError.from('Channel', 'id', liveEnt.channelId);

    let stream: LiveStreamDto | null = null;
    if (liveEnt.liveStreamId) {
      stream = await this.streamService.findById(liveEnt.liveStreamId, tx);
    }

    let result: LiveDtoMapped = {
      ...liveEnt,
      channel,
      platform,
      stream,
      isDisableRequested: isDisableRequested(liveEnt.status),
      isFinished: isFinished(liveEnt.status),
    };

    if (opt.nodes) {
      const req: NodeFieldsReq = { group: opt.nodeGroup ?? false };
      const nodes = await this.nodeFinder.findByLiveId(liveEnt.id, req, tx);
      result = { ...result, nodes };
    }
    return result;
  }
}
