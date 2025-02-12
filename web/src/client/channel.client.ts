import { ChannelAppend, ChannelUpdate, ChannelDto, ChannelPageResult } from '@/client/channel.types.ts';
import { configs } from '@/common/configs.ts';
import { getIngredients, request } from '@/client/utils.ts';
import { ChannelPageState } from '@/hooks/ChannelPageState.ts';

export async function fetchChannels(pageState: ChannelPageState, withTags: boolean = true) {
  let qs = pageState.toQueryString();
  if (withTags) {
    qs += '&wt=true';
  }
  const res = await request(`${configs.endpoint}/api/channels?${qs}`);
  return (await res.json()) as ChannelPageResult;
}

export async function createChannel(req: ChannelAppend) {
  const url = `${configs.endpoint}/api/channels`;
  const { method, headers, body } = getIngredients('POST', req);
  const res = await request(url, { method, headers, body });
  return (await res.json()) as ChannelDto;
}

export async function updateChannelPriority(id: string, priorityName: string) {
  const url = `${configs.endpoint}/api/channels/priority`;
  const req: ChannelUpdate = { id, form: { priorityName } };
  const { method, headers, body } = getIngredients('PATCH', req);
  const res = await request(url, { method, headers, body });
  return (await res.json()) as ChannelDto;
}

export async function updateChannelFollowed(id: string, followed: boolean) {
  const url = `${configs.endpoint}/api/channels/followed`;
  const req: ChannelUpdate = { id, form: { followed } };
  const { method, headers, body } = getIngredients('PATCH', req);
  const res = await request(url, { method, headers, body });
  return (await res.json()) as ChannelDto;
}

export async function updateChannelDescription(id: string, description: string | null) {
  const url = `${configs.endpoint}/api/channels/description`;
  const req: ChannelUpdate = { id, form: { description } };
  const { method, headers, body } = getIngredients('PATCH', req);
  const res = await request(url, { method, headers, body });
  return (await res.json()) as ChannelDto;
}

export async function deleteChannel(channelId: string) {
  const url = `${configs.endpoint}/api/channels/${channelId}`;
  const res = await request(url, { method: 'DELETE' });
  return (await res.json()) as ChannelDto;
}
