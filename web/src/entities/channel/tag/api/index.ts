export { tagDto, tagAttachment, tagDetachment, tagAppend, tagUpdate } from './tag.schema.ts';
export type { TagDto, TagAttachment, TagDetachment, TagAppend, TagUpdate } from './tag.schema.ts';

export {
  fetchTags,
  attachTag,
  detachTag,
  createTag,
  deleteTag,
  updateTagName,
  updateTagDescription,
} from './tag.client.ts';