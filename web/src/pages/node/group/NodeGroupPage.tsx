import { useQuery } from '@tanstack/react-query';
import { PageHeaderTab } from '@widgets/header';
import { fetchNodeGroups } from '@entities/node/group/api/node-group.client.ts';
import { NodeGroupTable } from './table';
import { NodeGroupDto } from '@entities/node/group/api/node-group.schema.ts';
import { NODE_GROUPS_QUERY_KEY } from '@shared/config';

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
