export interface TagDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface TagAttachment {
  channelId: string;
  tagName: string;
}

export interface TagDetachment {
  channelId: string;
  tagId: string;
}
