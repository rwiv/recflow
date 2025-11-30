import { Injectable } from '@nestjs/common';

import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';

import { headers, queryParams } from '@/common/data/common.schema.js';

import { db } from '@/infra/db/db.js';
import { Tx } from '@/infra/db/types.js';

import { ChannelFinder } from '@/channel/service/channel.finder.js';

import { LiveStreamDto } from '@/live/spec/live.dto.schema.js';
import { LiveStreamEnt } from '@/live/spec/live.entity.schema.js';

@Injectable()
export class LiveStreamMapper {
  constructor(private readonly channelFinder: ChannelFinder) {}

  async mapAll(entities: LiveStreamEnt[], tx: Tx = db) {
    return Promise.all(entities.map((ent) => this.map(ent, tx)));
  }

  async map(streamEnt: LiveStreamEnt, tx: Tx = db): Promise<LiveStreamDto> {
    const channel = await this.channelFinder.findById(streamEnt.channelId, tx);
    if (!channel) throw NotFoundError.from('Channel', 'id', streamEnt.channelId);
    return {
      ...streamEnt,
      params: streamEnt.params ? queryParams.parse(JSON.parse(streamEnt.params)) : null,
      headers: headers.parse(JSON.parse(streamEnt.headers)),
      channel,
    };
  }
}
