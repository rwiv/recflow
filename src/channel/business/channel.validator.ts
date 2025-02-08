import { Injectable } from '@nestjs/common';
import { hasDuplicates } from '../../utils/list.js';
import { ChannelQueryRepository } from '../persistence/channel.query.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { PlatformType } from '../../common/schema.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';

@Injectable()
export class ChannelValidator {
  constructor(private readonly chQuery: ChannelQueryRepository) {}

  async validateForm(
    pid: string,
    platform: PlatformType,
    tagNames: string[] | undefined = undefined,
  ) {
    if (tagNames && hasDuplicates(tagNames)) {
      throw new ConflictError('Duplicate tag names');
    }
    if (pid && platform) {
      const entities = await this.chQuery.findByPidAndPlatform(pid, platform);
      if (entities.length > 0) {
        throw new ConflictError('Channel already exists');
      }
    }
  }
}
