import { Injectable } from '@nestjs/common';
import { ChannelCreation, ChannelUpdate } from '../persistence/channel.types.js';
import { hasDuplicates } from '../../utils/list.js';

@Injectable()
export class ChannelValidator {
  validateCreate(req: ChannelCreation, reqTagNames: string[]): ChannelCreation {
    this.assertTagNames(reqTagNames);
    if (req.description === '') {
      req.description = null;
    }
    return req;
  }

  validateUpdate(req: ChannelUpdate, reqTagNames: string[]): ChannelUpdate {
    this.assertTagNames(reqTagNames);
    if (req.form.description === '') {
      req.form.description = null;
    }
    return req;
  }

  private assertTagNames(tagNames: string[]) {
    if (hasDuplicates(tagNames)) {
      throw new Error('Duplicate tag names');
    }
  }
}
