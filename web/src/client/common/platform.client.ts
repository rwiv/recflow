import { request } from '@/client/common/common.client.utils.ts';
import { configs } from '@/common/configs.ts';
import { PlatformDto } from '@/client/common/platform.schema.ts';

export async function fetchPlatforms() {
  const res = await request(`${configs.endpoint}/api/platforms`);
  const platforms = (await res.json()) as PlatformDto[];
  return platforms.filter((p) => p.name !== 'twitch').sort((a, b) => a.name.localeCompare(b.name));
}
