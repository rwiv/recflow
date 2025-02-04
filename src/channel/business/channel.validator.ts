import { Injectable } from '@nestjs/common';
import { ChannelCreation, ChannelUpdate } from './channel.types.js';
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

  validateUpdate(req: ChannelUpdate, reqTagNames: string[] | undefined): ChannelUpdate {
    if (reqTagNames) {
      this.assertTagNames(reqTagNames);
    }
    if (req.form.description === '') {
      req.form.description = null;
    }
    return req;
  }

  private assertTagNames(tagNames: string[]) {
    if (tagNames.length === 0) {
      return;
    }
    if (hasDuplicates(tagNames)) {
      throw new Error('Duplicate tag names');
    }
  }
}
