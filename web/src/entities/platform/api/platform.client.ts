import { configs } from '@/shared/config/configs.ts';
import { request } from '@/shared/lib/http/http_utils.ts';
import { PlatformDto } from '@/entities/platform/api/platform.schema.ts';

export async function fetchPlatforms() {
  const res = await request(`${configs.endpoint}/api/platforms`);
  const platforms = (await res.json()) as PlatformDto[];
  return platforms.filter((p) => p.name !== 'twitch').sort((a, b) => a.name.localeCompare(b.name));
}
