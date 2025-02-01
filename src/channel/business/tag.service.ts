import { TagRepository } from '../persistence/tag.repository.js';

export class TagService {
  constructor(private readonly tagRepo: TagRepository) {}

  update(tagId: string, name: string, description: string | null = null) {
    return this.tagRepo.update(tagId, name, description);
  }
}
