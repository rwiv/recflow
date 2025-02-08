import { Injectable } from '@nestjs/common';
import { TagRecord } from './tag.business.schema.js';
import { TagQueryRepository } from '../persistence/tag.query.js';

@Injectable()
export class TagFinder {
  constructor(private readonly tagQuery: TagQueryRepository) {}

  findAll(): Promise<TagRecord[]> {
    return this.tagQuery.findAll();
  }

  findById(tagId: string): Promise<TagRecord | undefined> {
    return this.tagQuery.findById(tagId);
  }
}
