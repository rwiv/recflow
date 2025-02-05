export interface TagRecord {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface TagEntUpdate {
  tagId: string;
  form: {
    name?: string;
    description?: string | null;
  };
}

export interface TagEntAttachment {
  channelId: string;
  tagName: string;
}

export interface TagEntDetachment {
  channelId: string;
  tagId: string;
}
