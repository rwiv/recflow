import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { NodeDtoWithLives } from '../../node/spec/node.dto.mapped.schema.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';

interface LiveAttr {
  liveId: string;
  platform: string;
  channelId: string;
  channelName: string;
  liveTitle: string;
  node?: string;
  assigned?: number;
  stacktrace?: string;
}

export function liveAttr(live: LiveDto, node: NodeDtoWithLives | null = null) {
  const attr: LiveAttr = {
    liveId: live.id,
    platform: live.platform.name,
    channelId: live.channel.pid,
    channelName: live.channel.username,
    liveTitle: live.liveTitle,
  };
  if (node) {
    attr.node = node.name;
    if (node.lives) {
      attr.assigned = node.lives.length;
    }
  }
  return attr;
}

export function liveInfoAttr(liveInfo: LiveInfo) {
  return {
    platform: liveInfo.type,
    channelId: liveInfo.pid,
    channelName: liveInfo.channelName,
    liveTitle: liveInfo.liveTitle,
  };
}
