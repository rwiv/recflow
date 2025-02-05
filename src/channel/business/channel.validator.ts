import { Injectable } from '@nestjs/common';
import { ChannelCreation, ChannelRecordUpdate } from './channel.types.js';
import { hasDuplicates } from '../../utils/list.js';

@Injectable()
export class ChannelValidator {
  validateCreate(req: ChannelCreation): ChannelCreation {
    this.assertTagNames(req.tagNames);
    let result = { ...req };
    if (req.description === '') {
      result = { ...result, description: null };
    }
    return result;
  }

  validateUpdate(req: ChannelRecordUpdate): ChannelRecordUpdate {
    if (req.tagNames) {
      this.assertTagNames(req.tagNames);
    }
    let result = { ...req, form: { ...req.form } };
    if (req.form.description === '') {
      result = { ...result, form: { ...req.form, description: null } };
    }
    return result;
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
