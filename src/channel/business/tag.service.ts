import { TagRepository } from '../persistence/tag.repository.js';
import { TagAttachment, TagDetachment, TagUpdate } from '../persistence/tag.types.js';
import { TagRecord } from './tag.types.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TagService {
  constructor(private readonly tagRepo: TagRepository) {}

  update(req: TagUpdate): Promise<TagRecord> {
    return this.tagRepo.update(req);
  }

  attach(req: TagAttachment): Promise<TagRecord> {
    return this.tagRepo.attach(req);
  }

  detach(req: TagDetachment) {
    return this.tagRepo.detach(req);
  }

  findAll(): Promise<TagRecord[]> {
    return this.tagRepo.findAll();
  }
}
