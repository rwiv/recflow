import { Injectable } from '@nestjs/common';
import { ChannelCreationBase, ChannelRecordUpdate } from './channel.types.js';
import { hasDuplicates } from '../../utils/list.js';
import { ChannelEntCreation } from '../persistence/channel.types.js';

@Injectable()
export class ChannelValidator {
  validateCreateEnt(req: ChannelEntCreation, tagNames: string[]): ChannelEntCreation {
    this.assertTagNames(tagNames);
    let result = { ...req };
    if (req.description === '') {
      result = { ...result, description: null };
    }
    return result;
  }

  validateCreateBase(req: ChannelCreationBase): ChannelCreationBase {
    if (req.tagNames) {
      this.assertTagNames(req.tagNames);
    }
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
    if (tagNames.filter((name) => name.length === 0).length > 0) {
      throw new Error('Empty tag name');
    }
    if (hasDuplicates(tagNames)) {
      throw new Error('Duplicate tag names');
    }
  }
}
