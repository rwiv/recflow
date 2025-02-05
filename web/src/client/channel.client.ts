import { ChannelCreation, ChannelDefUpdate, ChannelRecord } from '@/client/channel.types.ts';
import { configs } from '@/common/configs.ts';
import { ChannelPriority } from '@/common/enum.types.ts';
import { getIngredients } from '@/client/utils.ts';
import { ChannelPageState } from '@/common/channel.page.ts';

export async function fetchChannels(pageState: ChannelPageState, withTags = true) {
  const { curPageNum: p, pageSize: s, sorted: st, priority: pri, tagName: tn } = pageState;
  let qs = `?p=${p}&s=${s}&wt=${withTags}`;
  if (st) {
    qs += `&st=${st}`;
  }
  if (pri) {
    qs += `&pri=${pri}`;
  }
  if (tn) {
    qs += `&tn=${tn}`;
  }
  const res = await fetch(`${configs.endpoint}/api/channels${qs}`);
  return (await res.json()) as ChannelRecord[];
}

export async function createChannel(req: ChannelCreation) {
  const url = `${configs.endpoint}/api/channels`;
  const { method, headers, body } = getIngredients('POST', req);
  return (await (await fetch(url, { method, headers, body })).json()) as ChannelRecord;
}

export async function updateChannelPriority(id: string, priority: ChannelPriority) {
  const url = `${configs.endpoint}/api/channels/priority`;
  const req: ChannelDefUpdate = { id, form: { priority } };
  const { method, headers, body } = getIngredients('PATCH', req);
  return (await (await fetch(url, { method, headers, body })).json()) as ChannelRecord;
}

export async function updateChannelFollowed(id: string, followed: boolean) {
  const url = `${configs.endpoint}/api/channels/followed`;
  const req: ChannelDefUpdate = { id, form: { followed } };
  const { method, headers, body } = getIngredients('PATCH', req);
  return (await (await fetch(url, { method, headers, body })).json()) as ChannelRecord;
}

export async function updateChannelDescription(id: string, description: string) {
  const url = `${configs.endpoint}/api/channels/description`;
  const req: ChannelDefUpdate = { id, form: { description } };
  const { method, headers, body } = getIngredients('PATCH', req);
  return (await (await fetch(url, { method, headers, body })).json()) as ChannelRecord;
}

export async function deleteChannel(channelId: string) {
  const url = `${configs.endpoint}/api/channels/${channelId}`;
  const res = await fetch(url, { method: 'DELETE' });
  return (await res.json()) as ChannelRecord;
}
