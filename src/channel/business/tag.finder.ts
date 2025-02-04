import { Injectable } from '@nestjs/common';
import { TagRecord } from './tag.types.js';
import { TagQueryRepository } from '../persistence/tag.query.js';

@Injectable()
export class TagFinder {
  constructor(private readonly tagQuery: TagQueryRepository) {}

  findAll(): Promise<TagRecord[]> {
    return this.tagQuery.findAll();
  }
}
