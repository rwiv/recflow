import { Injectable } from '@nestjs/common';

import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';

import { db } from '@/infra/db/db.js';
import { Tx } from '@/infra/db/types.js';

import { TagAppend, TagAttachment, TagDetachment, TagDto, TagUpdate } from '@/channel/spec/tag.dto.schema.js';
import { ChannelsToTagsEntAppend, TagEntAppend } from '@/channel/spec/tag.entity.schema.js';
import { ChannelCommandRepository } from '@/channel/storage/channel.command.js';
import { ChannelQueryRepository } from '@/channel/storage/channel.query.js';
import { TagCommandRepository } from '@/channel/storage/tag.command.js';
import { TagQueryRepository } from '@/channel/storage/tag.query.js';

@Injectable()
export class TagWriter {
  constructor(
    private readonly tagCmd: TagCommandRepository,
    private readonly tagQuery: TagQueryRepository,
    private readonly chQuery: ChannelQueryRepository,
    private readonly chCmd: ChannelCommandRepository,
  ) {}

  create(append: TagAppend, tx: Tx = db) {
    return this.tagCmd.create(append, tx);
  }

  attach(attach: TagAttachment, tx: Tx = db): Promise<TagDto> {
    return tx.transaction(async (txx) => {
      let tag = await this.tagQuery.findByName(attach.tagName, txx);
      if (!tag) {
        const append: TagEntAppend = { name: attach.tagName };
        tag = await this.tagCmd.create(append, txx);
      }
      const bind: ChannelsToTagsEntAppend = {
        channelId: attach.channelId,
        tagId: tag.id,
      };
      await this.tagCmd.bind(bind, txx);
      await this.chCmd.setUpdatedAtNow(attach.channelId, tx);
      return tag;
    });
  }

  async bind(bind: ChannelsToTagsEntAppend, tx: Tx = db) {
    const tag = await this.tagQuery.findById(bind.tagId, tx);
    if (!tag) {
      throw NotFoundError.from('ChannelTag', 'id', bind.tagId);
    }
    await this.tagCmd.bind(bind, tx);
    await this.chCmd.setUpdatedAtNow(bind.channelId, tx);
    return tag;
  }

  detach(detach: TagDetachment, tx: Tx = db) {
    return tx.transaction(async (txx) => {
      await this.tagCmd.unbind(detach.channelId, detach.tagId, txx);
      await this.chCmd.setUpdatedAtNow(detach.channelId, tx);
    });
  }

  update(id: string, update: TagUpdate, tx: Tx = db) {
    return this.tagCmd.update(id, update, tx);
  }

  delete(id: string, tx: Tx = db) {
    return this.tagCmd.delete(id, tx);
  }
}
