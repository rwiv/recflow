import { request } from '@/client/utils.ts';
import { configs } from '@/common/configs.ts';
import { PlatformDto } from '@/client/common.schema.ts';

export async function fetchPlatforms() {
  const res = await request(`${configs.endpoint}/api/platforms`);
  const platforms = (await res.json()) as PlatformDto[];
  return platforms.filter((p) => p.name !== 'twitch').sort((a, b) => a.name.localeCompare(b.name));
}
