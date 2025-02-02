export interface TagRecord {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface TagCreation {
  name: string;
  description?: string;
}

export interface TagUpdate {
  tagId: string;
  form: {
    name: string;
    description?: string | null;
  };
}

export interface TagAttachment {
  channelId: string;
  tagName: string;
}

export interface TagDetachment {
  channelId: string;
  tagId: string;
}
