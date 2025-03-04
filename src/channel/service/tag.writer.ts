import { TagCommandRepository } from '../storage/tag.command.js';
import { TagAttachment, TagDetachment, TagDto } from '../spec/tag.dto.schema.js';
import { Injectable } from '@nestjs/common';
import { TagQueryRepository } from '../storage/tag.query.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { ChannelQueryRepository } from '../storage/channel.query.js';
import { ChannelsToTagsEntAppend, TagEntAppend } from '../spec/tag.entity.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { ChannelCommandRepository } from '../storage/channel.command.js';

@Injectable()
export class TagWriter {
  constructor(
    private readonly tagCmd: TagCommandRepository,
    private readonly tagQuery: TagQueryRepository,
    private readonly chQuery: ChannelQueryRepository,
    private readonly chCmd: ChannelCommandRepository,
  ) {}

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
      if ((await this.chQuery.findByTagId(detach.tagId, 1, txx)).length === 0) {
        await this.tagCmd.delete(detach.tagId, txx);
      }
      await this.chCmd.setUpdatedAtNow(detach.channelId, tx);
    });
  }
}
