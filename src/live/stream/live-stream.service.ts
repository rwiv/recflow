import { Injectable } from '@nestjs/common';
import { LiveStreamAppend, LiveStreamDto, LiveStreamUpdate, StreamInfo } from '../spec/live.dto.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { LiveStreamQuery, LiveStreamRepository } from '../storage/live-stream.repository.js';
import { LiveStreamMapper } from './live-stream.mapper.js';

export interface LiveStreamCreationArgs {
  streamInfo: StreamInfo;
  channelId: string;
  sourceId: string;
}

@Injectable()
export class LiveStreamService {
  constructor(
    private readonly liveStreamRepo: LiveStreamRepository,
    private readonly mapper: LiveStreamMapper,
  ) {}

  async findById(id: string, tx: Tx = db) {
    const ent = await this.liveStreamRepo.findById(id, tx);
    if (!ent) return null;
    return this.mapper.map(ent);
  }

  async findLiveCountByStreamId(streamId: string, tx: Tx = db) {
    return this.liveStreamRepo.findLiveCountByStreamId(streamId, tx);
  }

  async findByQueryLatestOne(query: LiveStreamQuery, tx: Tx = db) {
    const ent = await this.liveStreamRepo.findByLiveAndChannel(query, tx);
    if (ent.length === 0) return null;
    return this.mapper.map(ent[0]);
  }

  async findEarliestChecked(limit: number, tx: Tx = db): Promise<LiveStreamDto[]> {
    const entities = await this.liveStreamRepo.findEarliestChecked(limit, tx);
    return this.mapper.mapAll(entities, tx);
  }

  async create(args: LiveStreamCreationArgs, tx: Tx = db): Promise<LiveStreamDto> {
    const append: LiveStreamAppend = {
      sourceId: args.sourceId,
      channelId: args.channelId,
      url: args.streamInfo.url,
      headers: JSON.stringify(args.streamInfo.headers),
      params: args.streamInfo.params ? JSON.stringify(args.streamInfo.params) : null,
    };
    const ent = await this.liveStreamRepo.create(append, tx);
    return this.mapper.map(ent);
  }

  async delete(id: string, tx: Tx = db) {
    await this.liveStreamRepo.delete(id, tx);
  }

  async update(id: string, update: LiveStreamUpdate, tx: Tx = db) {
    await this.liveStreamRepo.update(id, update, tx);
  }
}
