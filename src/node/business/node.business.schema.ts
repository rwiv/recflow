import { z } from 'zod';
import { nodeEnt, nodeGroupEnt, nodeStateEnt } from '../persistence/node.persistence.schema.js';
import { nodeTypeEnum } from '../node.schema.js';

export const nodeRecord = nodeEnt.omit({ typeId: true }).extend({
  typeName: nodeTypeEnum,
  group: nodeGroupEnt.optional(),
  states: z.array(nodeStateEnt).optional(),
});
export type NodeRecord = z.infer<typeof nodeRecord>;

export const nodeAppend = nodeRecord
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    group: true,
    states: true,
  })
  .extend({
    capacities: z.array(
      z.object({
        platformName: z.string().nonempty(),
        capacity: z.number().nonnegative(),
      }),
    ),
  });
export type NodeAppend = z.infer<typeof nodeAppend>;

const nodeState = nodeStateEnt;
export type NodeState = z.infer<typeof nodeState>;

const nodeGroup = nodeGroupEnt;
export type NodeGroup = z.infer<typeof nodeGroup>;
