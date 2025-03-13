import { NodeAppend } from '../../node/spec/node.dto.schema.js';

export function mockNode(n: number, groupId: string): NodeAppend {
  return {
    name: `node${n}`,
    endpoint: 'http://localhost:3000',
    weight: 1,
    typeName: 'worker',
    groupId,
    capacities: [
      { platformName: 'chzzk', capacity: 10 },
      { platformName: 'soop', capacity: 5 },
      { platformName: 'twitch', capacity: 5 },
    ],
  };
}
