import { Injectable } from '@nestjs/common';
import { ChannelRecordForm } from './channel.types.js';
import { hasDuplicates } from '../../utils/list.js';
import { ChannelQueryRepository } from '../persistence/channel.query.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';

@Injectable()
export class ChannelValidator {
  constructor(private readonly chanQuery: ChannelQueryRepository) {}

  async validateForm(req: ChannelRecordForm, tagNames: string[] | undefined = undefined) {
    if (tagNames) {
      this.assertTagNames(tagNames);
    }
    if (req.description === '') {
      throw new ValidationError('Empty description');
    }
    const { pid, platform } = req;
    if (pid && platform) {
      const channels = await this.chanQuery.findByPidAndPlatform(pid, platform);
      if (channels.length > 0) {
        throw new ValidationError('Channel already exists');
      }
    }
  }

  private assertTagNames(tagNames: string[]) {
    if (tagNames.length === 0) {
      return;
    }
    if (tagNames.filter((name) => name.length === 0).length > 0) {
      throw new ValidationError('Empty tag name');
    }
    if (hasDuplicates(tagNames)) {
      throw new ValidationError('Duplicate tag names');
    }
  }
}
