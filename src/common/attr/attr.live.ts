import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { NodeDtoWithLives } from '../../node/spec/node.dto.mapped.schema.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { stacktrace } from '../../utils/errors/utils.js';

interface LiveAttr {
  liveId: string;
  platform: string;
  channelId: string;
  channelName: string;
  liveTitle: string;
  node?: string;
  assigned?: number;
  stack?: string;
}

interface Options {
  node?: NodeDtoWithLives | null;
  err?: unknown;
}

export function liveAttr(live: LiveDto, opts?: Options) {
  const attr: LiveAttr = {
    liveId: live.id,
    platform: live.platform.name,
    channelId: live.channel.pid,
    channelName: live.channel.username,
    liveTitle: live.liveTitle,
  };
  if (opts) {
    const { node, err } = opts;
    if (node) {
      attr.node = node.name;
      if (node.lives) {
        attr.assigned = node.lives.length;
      }
    }
    if (err) {
      attr.stack = stacktrace(err);
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
