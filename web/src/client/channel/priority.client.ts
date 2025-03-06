import {request} from "@/client/common/common.client.utils.ts";
import {configs} from "@/common/configs.ts";
import {PriorityDto} from "@/client/channel/channel.types.ts";

export async function fetchPriorities() {
  const res = await request(`${configs.endpoint}/api/channels/priorities`);
  const priorities = (await res.json()) as PriorityDto[];
  return priorities.sort((a, b) => a.seq - b.seq);
}
