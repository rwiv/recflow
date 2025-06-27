import { ChannelDto } from '../../channel/spec/channel.dto.schema.js';
import { PriorityDto } from '../../channel/spec/priority.schema.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { NodeDtoWithLives } from '../../node/spec/node.dto.mapped.schema.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { stacktrace } from '../../utils/errors/utils.js';

interface LiveAttr {
  platform: string;
  live_id: string;
  live_title: string;
  channel_uid: string;
  channel_name: string;
  priority_name: string;
  priority_tier: number;
  criterion_name?: string;
  node_name?: string;
  node_assigned_count?: number;
  stack_trace?: string;
}

interface LiveInfoAttr {
  platform: string;
  live_id: string;
  live_title: string;
  channel_uid: string;
  channel_name: string;
  priority_name?: string;
  priority_tier?: number;
  criterion_name?: string;
}

interface Options {
  cr?: CriterionDto;
  node?: NodeDtoWithLives | null;
  pri?: PriorityDto;
  err?: unknown;
}

export function liveAttr(live: LiveDto, opts?: Options) {
  const attr: LiveAttr = {
    platform: live.platform.name,
    live_id: live.id,
    live_title: live.liveTitle,
    channel_uid: live.channel.pid,
    channel_name: live.channel.username,
    priority_name: live.channel.priority.name,
    priority_tier: live.channel.priority.tier,
  };
  if (opts) {
    const { node, cr, pri, err } = opts;
    if (node) {
      attr.node_name = node.name;
      if (node.lives) {
        attr.node_assigned_count = node.lives.length;
      }
    }
    if (cr) {
      attr.criterion_name = cr.name;
    }
    if (err) {
      attr.stack_trace = stacktrace(err);
    }
  }
  return attr;
}

export function liveInfoAttr(liveInfo: LiveInfo, opts?: Options) {
  const attr: LiveInfoAttr = {
    platform: liveInfo.type,
    live_id: liveInfo.liveId,
    live_title: liveInfo.liveTitle,
    channel_uid: liveInfo.pid,
    channel_name: liveInfo.channelName,
  };
  const pri = opts?.pri;
  if (pri) {
    attr.priority_name = pri.name;
    attr.priority_tier = pri.tier;
  }
  const cr = opts?.cr;
  if (cr) {
    attr.criterion_name = cr.name;
  }
  return attr;
}

export function channelAttr(channel: ChannelDto) {
  return {
    platform: channel.platform.name,
    channel_id: channel.id,
    channel_uid: channel.pid,
    channel_name: channel.username,
    priority_name: channel.priority.name,
    priority_tier: channel.priority.tier,
  };
}
