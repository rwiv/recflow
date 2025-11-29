import { configs } from '@shared/config';
import { request } from '@shared/lib/http';
import { PlatformDto } from './platform.schema.ts';

export async function fetchPlatforms() {
  const res = await request(`${configs.endpoint}/api/platforms`);
  const platforms = (await res.json()) as PlatformDto[];
  return platforms.filter((p) => p.name !== 'twitch').sort((a, b) => a.name.localeCompare(b.name));
}
