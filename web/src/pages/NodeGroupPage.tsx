import { useQuery } from '@tanstack/react-query';
import { NODE_GROUPS_QUERY_KEY, TASK_QUERY_KEY } from '@/common/constants.ts';
import { PageHeaderTab } from '@/components/common/layout/PageHeaderTab.tsx';
import { fetchNodeGroups } from '@/client/node/node-group.client.ts';
import { NodeGroupDto } from '@/client/node/node.schema.ts';
import { NodeGroupTable } from '@/components/nodegroup/NodeGroupTable.tsx';
import { TaskInfo } from '@/client/task/task.schema.ts';
import { fetchTasks } from '@/client/task/task.client.ts';

export function NodeGroupPage() {
  const { data: nodeGroups } = useQuery<NodeGroupDto[]>({
    queryKey: [NODE_GROUPS_QUERY_KEY],
    queryFn: fetchNodeGroups,
  });
  const { data: tasks } = useQuery<TaskInfo[]>({
    queryKey: [TASK_QUERY_KEY],
    queryFn: fetchTasks,
  });

  return (
    <div>
      <PageHeaderTab nodeGroup />
      <div className="mx-10 my-3">
        {nodeGroups && tasks && <NodeGroupTable groups={nodeGroups} tasks={tasks} />}
      </div>
    </div>
  );
}
