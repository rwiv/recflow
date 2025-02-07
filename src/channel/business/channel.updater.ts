import { ChannelCommandRepository } from '../persistence/channel.command.js';
import { ChannelValidator } from './channel.validator.js';
import { Injectable } from '@nestjs/common';
import { ChannelDefUpdate, ChannelRecord } from './channel.types.js';
import { ChannelPriority } from '../priority/types.js';
import { ChannelMapper } from './channel.mapper.js';

@Injectable()
export class ChannelUpdater {
  constructor(
    private readonly chCmd: ChannelCommandRepository,
    private readonly chMapper: ChannelMapper,
    private readonly validator: ChannelValidator,
  ) {}

  async updatePriority(id: string, priority: ChannelPriority): Promise<ChannelRecord> {
    return this.updateRecord({ id, form: { priority } });
  }

  async updateFollowed(id: string, followed: boolean): Promise<ChannelRecord> {
    return this.updateRecord({ id, form: { followed } });
  }

  async updateDescription(id: string, description: string | null): Promise<ChannelRecord> {
    return this.updateRecord({ id, form: { description } });
  }

  async updateRecord(req: ChannelDefUpdate): Promise<ChannelRecord> {
    await this.validator.validateForm(req.form);
    const ent = await this.chCmd.update(req);
    return this.chMapper.map(ent);
  }
}
