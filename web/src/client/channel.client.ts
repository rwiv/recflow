import {
  ChannelAppend,
  ChannelUpdate,
  ChannelDto,
  ChannelPageResult,
  PriorityDto,
} from '@/client/channel.types.ts';
import { configs } from '@/common/configs.ts';
import { getIngredients, request } from '@/client/utils.ts';
import { ChannelPageState } from '@/hooks/channel/ChannelPageState.ts';

export async function fetchChannels(pageState: ChannelPageState, withTags: boolean = true) {
  let qs = pageState.toQueryString();
  if (withTags) {
    qs += '&wt=true';
  }
  const res = await request(`${configs.endpoint}/api/channels?${qs}`);
  return (await res.json()) as ChannelPageResult;
}

export async function fetchPriorities() {
  const res = await request(`${configs.endpoint}/api/channels/priorities`);
  const priorities = (await res.json()) as PriorityDto[];
  return priorities.sort((a, b) => a.seq - b.seq);
}

export async function createChannel(req: ChannelAppend) {
  const url = `${configs.endpoint}/api/channels`;
  const { method, headers, body } = getIngredients('POST', req);
  const res = await request(url, { method, headers, body });
  return (await res.json()) as ChannelDto;
}

export async function updateChannelPriority(id: string, priorityId: string) {
  return updateChannel(id, undefined, undefined, priorityId);
}

export async function updateChannelIsFollowed(id: string, isFollowed: boolean) {
  return updateChannel(id, undefined, isFollowed);
}

export async function updateChannelDescription(id: string, description: string | null) {
  return updateChannel(id, description);
}

async function updateChannel(
  id: string,
  description?: string | null,
  isFollowed?: boolean,
  priorityId?: string,
) {
  const url = `${configs.endpoint}/api/channels/${id}`;
  const req: ChannelUpdate = { description, isFollowed, priorityId };
  const { method, headers, body } = getIngredients('PUT', req);
  const res = await request(url, { method, headers, body });
  return (await res.json()) as ChannelDto;
}

export async function deleteChannel(channelId: string) {
  const url = `${configs.endpoint}/api/channels/${channelId}`;
  await request(url, { method: 'DELETE' });
}
