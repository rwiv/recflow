import { request } from '@/client/utils.ts';
import { configs } from '@/common/configs.ts';
import { PlatformDto } from '@/client/common.schema.ts';

export async function fetchPlatforms() {
  const res = await request(`${configs.endpoint}/api/platforms`);
  return (await res.json()) as PlatformDto[];
}
