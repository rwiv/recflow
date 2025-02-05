import { configs } from '@/common/configs.ts';
import { NodeRecord } from '@/client/node.types.ts';

export async function fetchNodes() {
  const res = await fetch(`${configs.endpoint}/api/lives/nodes`);
  return (await res.json()) as NodeRecord[];
}
