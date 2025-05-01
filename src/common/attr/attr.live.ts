import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { NodeDtoWithLives } from '../../node/spec/node.dto.mapped.schema.js';

interface LiveNodeAttr {
  liveId: string;
  platform: string;
  channelId: string;
  channelName: string;
  title: string;
  node?: string;
  assigned?: number;
}

export function liveNodeAttr(live: LiveDto, node: NodeDtoWithLives | null = null) {
  const attr: LiveNodeAttr = {
    liveId: live.id,
    platform: live.platform.name,
    channelId: live.channel.pid,
    channelName: live.channel.username,
    title: live.liveTitle,
  };
  if (node) {
    attr.node = node.name;
    if (node.lives) {
      attr.assigned = node.lives.length;
    }
  }
  return attr;
}
