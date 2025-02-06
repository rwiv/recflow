import { ChannelDef } from '../persistence/channel.types.js';
import { TagRecord } from './tag.types.js';
import { PlatformType } from '../../platform/types.js';
import { ChannelPriority } from '../priority/types.js';

export interface ChannelRecord extends ChannelDef {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: TagRecord[];
}

export interface ChannelCreationBase {
  priority: ChannelPriority;
  followed: boolean;
  description: string | null;
  tagNames?: string[];
}

export interface ChannelCreation extends ChannelCreationBase {
  pid: string;
  platform: PlatformType;
}

export interface ChannelDefForm {
  priority?: ChannelPriority;
  followed?: boolean;
  description?: string | null;
}

export interface ChannelRecordForm extends ChannelDefForm {
  pid?: string;
  platform?: PlatformType;
}

export interface ChannelDefUpdate {
  id: string;
  form: ChannelDefForm;
}

export interface ChannelRecordUpdate {
  id: string;
  form: ChannelRecordForm;
  tagNames?: string[];
}
