import { TagCommandRepository } from '../persistence/tag.command.js';
import { TagAttachment, TagDetachment, TagRecord } from './tag.schema.js';
import { Injectable } from '@nestjs/common';
import { TagQueryRepository } from '../persistence/tag.query.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { ChannelQueryRepository } from '../persistence/channel.query.js';
import { TagEntUpdate } from '../persistence/tag.schema.js';

@Injectable()
export class TagWriter {
  constructor(
    private readonly tagCmd: TagCommandRepository,
    private readonly tagQuery: TagQueryRepository,
    private readonly chQuery: ChannelQueryRepository,
  ) {}

  update(req: TagEntUpdate): Promise<TagRecord> {
    return this.tagCmd.update(req);
  }

  attach(req: TagAttachment, tx: Tx = db): Promise<TagRecord> {
    return tx.transaction(async (txx) => {
      let tag = await this.tagQuery.findByName(req.tagName, txx);
      if (!tag) {
        tag = await this.tagCmd.create({ name: req.tagName }, txx);
      }
      await this.tagCmd.bind(req.channelId, tag.id, txx);
      return tag;
    });
  }

  detach(req: TagDetachment, tx: Tx = db) {
    return tx.transaction(async (txx) => {
      await this.tagCmd.unbind(req.channelId, req.tagId, txx);
      if ((await this.chQuery.findChannelsByTagId(req.tagId, 1, txx)).length === 0) {
        await this.tagCmd.delete(req.tagId, txx);
      }
    });
  }
}
