import { ChannelCreation, ChannelUpdate } from '../persistence/channel.types.js';

export interface ChannelCreationReq {
  creation: ChannelCreation;
  tagNames: string[];
}

export interface ChannelUpdateReq {
  update: ChannelUpdate;
  tagNames: string[];
}
