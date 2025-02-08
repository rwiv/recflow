import { TagCommandRepository } from '../persistence/tag.command.js';
import { TagAttachment, TagDetachment, TagRecord } from './tag.schema.js';
import { Injectable } from '@nestjs/common';
import { TagQueryRepository } from '../persistence/tag.query.js';
import { Tx } from '../../../infra/db/types.js';
import { db } from '../../../infra/db/db.js';
import { ChannelQueryRepository } from '../../channel/persistence/channel.query.js';
import { tagEntAppend, TagEntAppend, TagEntUpdate } from '../persistence/tag.schema.js';

@Injectable()
export class TagWriter {
  constructor(
    private readonly tagCmd: TagCommandRepository,
    private readonly tagQuery: TagQueryRepository,
    private readonly chQuery: ChannelQueryRepository,
  ) {}

  update(update: TagEntUpdate): Promise<TagRecord> {
    return this.tagCmd.update(update);
  }

  attach(attach: TagAttachment, tx: Tx = db): Promise<TagRecord> {
    return tx.transaction(async (txx) => {
      let tag = await this.tagQuery.findByName(attach.tagName, txx);
      if (!tag) {
        const append: TagEntAppend = { name: attach.tagName };
        tag = await this.tagCmd.create(tagEntAppend.parse(append), txx);
      }
      await this.tagCmd.bind(attach.channelId, tag.id, txx);
      return tag;
    });
  }

  detach(detach: TagDetachment, tx: Tx = db) {
    return tx.transaction(async (txx) => {
      await this.tagCmd.unbind(detach.channelId, detach.tagId, txx);
      if ((await this.chQuery.findChannelsByTagId(detach.tagId, 1, txx)).length === 0) {
        await this.tagCmd.delete(detach.tagId, txx);
      }
    });
  }
}
