import { useQuery } from '@tanstack/react-query';

import { NodeGroupDto } from '@/entities/node/group/model/node-group.schema.ts';

import { fetchNodeGroups } from '@/features/node/group/api/node-group.client.ts';
import { NODE_GROUPS_QUERY_KEY } from '@/features/node/group/config/constants.ts';

import { PageHeaderTab } from '@/widgets/header/ui/PageHeaderTab.tsx';

import { NodeGroupTable } from '@/pages/node/group/ui/table/NodeGroupTable.tsx';

export function NodeGroupPage() {
  const { data: nodeGroups } = useQuery<NodeGroupDto[]>({
    queryKey: [NODE_GROUPS_QUERY_KEY],
    queryFn: fetchNodeGroups,
  });

  return (
    <div>
      <PageHeaderTab nodeGroup />
      <div className="mx-10 my-3">{nodeGroups && <NodeGroupTable groups={nodeGroups} />}</div>
    </div>
  );
}
