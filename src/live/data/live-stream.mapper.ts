import { LiveStreamEnt } from '../spec/live.entity.schema.js';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { LiveStreamDto } from '../spec/live.dto.schema.js';
import { headers, queryParams } from '../../common/data/common.schema.js';

@Injectable()
export class LiveStreamMapper {
  constructor(private readonly channelFinder: ChannelFinder) {}

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
