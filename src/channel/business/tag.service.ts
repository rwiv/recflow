import { TagCommandRepository } from '../persistence/tag.command.repository.js';
import { TagEntAttachment, TagEntDetachment, TagEntUpdate } from '../persistence/tag.types.js';
import { TagRecord } from './tag.types.js';
import { Injectable } from '@nestjs/common';
import { TagQueryRepository } from '../persistence/tag.query.repository.js';

@Injectable()
export class TagService {
  constructor(
    private readonly tagCmdRepo: TagCommandRepository,
    private readonly tagQueryRepo: TagQueryRepository,
  ) {}

  update(req: TagEntUpdate): Promise<TagRecord> {
    return this.tagCmdRepo.update(req);
  }

  attach(req: TagEntAttachment): Promise<TagRecord> {
    return this.tagCmdRepo.attach(req);
  }

  detach(req: TagEntDetachment) {
    return this.tagCmdRepo.detach(req);
  }

  findAll(): Promise<TagRecord[]> {
    return this.tagQueryRepo.findAll();
  }
}
