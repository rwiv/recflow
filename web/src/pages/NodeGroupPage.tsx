import { useQuery } from '@tanstack/react-query';
import { NODE_GROUPS_QUERY_KEY } from '@/common/constants.ts';
import { PageHeaderTab } from '@/components/common/layout/PageHeaderTab.tsx';
import { fetchNodeGroups } from '@/client/node/node-group.client.ts';
import { NodeGroupDto } from '@/client/node/node.schema.ts';
import { NodeGroupTable } from '@/components/nodegroup/NodeGroupTable.tsx';

export function NodeGroupPage() {
  const { data: nodeGroups } = useQuery<NodeGroupDto[]>({
    queryKey: [NODE_GROUPS_QUERY_KEY],
    queryFn: fetchNodeGroups,
  });

  return (
    <div>
      <PageHeaderTab nodeGroup />
      <div className="mx-10 my-3">{nodeGroups && <NodeGroupTable data={nodeGroups} />}</div>
    </div>
  );
}
