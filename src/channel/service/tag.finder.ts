import { Injectable } from '@nestjs/common';

import { TagDto } from '@/channel/spec/tag.dto.schema.js';
import { TagQueryRepository } from '@/channel/storage/tag.query.js';

@Injectable()
export class TagFinder {
  constructor(private readonly tagQuery: TagQueryRepository) {}

  findAll(): Promise<TagDto[]> {
    return this.tagQuery.findAll();
  }

  findById(tagId: string): Promise<TagDto | null> {
    return this.tagQuery.findById(tagId);
  }
}
