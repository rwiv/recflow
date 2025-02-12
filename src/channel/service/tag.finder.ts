import { Injectable } from '@nestjs/common';
import { TagDto } from '../spec/tag.dto.schema.js';
import { TagQueryRepository } from '../storage/tag.query.js';

@Injectable()
export class TagFinder {
  constructor(private readonly tagQuery: TagQueryRepository) {}

  findAll(): Promise<TagDto[]> {
    return this.tagQuery.findAll();
  }

  findById(tagId: string): Promise<TagDto | undefined> {
    return this.tagQuery.findById(tagId);
  }
}
