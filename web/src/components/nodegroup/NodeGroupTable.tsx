import { TableContent } from '@/components/common/table/TableContent.tsx';
import { FilterInput } from '@/components/common/table/FilterInput.tsx';
import { ColumnSelector } from '@/components/common/table/ColumnSelector.tsx';
import { SelectedRowCount } from '@/components/common/table/SelectedRowCount.tsx';
import { PageNavigation } from '@/components/common/table/PageNavigation.tsx';
import { useTable } from '@/components/common/table/useTable.ts';
import { useQueryClient } from '@tanstack/react-query';
import { NODE_GROUPS_QUERY_KEY, NODES_QUERY_KEY, TASK_QUERY_KEY } from '@/common/constants.ts';
import { Button } from '@/components/ui/button.tsx';
import { NodeGroupCreateButton } from '@/components/nodegroup/NodeGroupCreateButton.tsx';
import { NodeGroupDto } from '@/client/node/node.schema.ts';
import { nodeGroupColumns } from '@/components/nodegroup/nodeGroupColumns.tsx';
import { drainNodeGroup, deleteNodeGroup } from '@/client/node/node-group.client.ts';
import { fetchNodes, updateNode } from '@/client/node/node.client.ts';
import { TaskInfo } from '@/client/task/task.schema.ts';
import { LIVE_ALLOCATION_TASK_NAME } from '@/client/task/task.constants.ts';
import { startAllocationTask, stopAllocationTask } from '@/client/task/task.client.ts';

interface NodeGroupTableProps {
  groups: NodeGroupDto[];
  tasks: TaskInfo[];
}

export function NodeGroupTable({ groups, tasks }: NodeGroupTableProps) {
  const queryClient = useQueryClient();
  const table = useTable(groups, nodeGroupColumns);

  const disabledAdjustBtn = table.getFilteredSelectedRowModel().rows.length !== 1;
  const enabledAllocationTask = !!tasks.find((task) => task.name === LIVE_ALLOCATION_TASK_NAME);

  const onUpdateAllocationTask = async (isStart: boolean) => {
    if (isStart) {
      await startAllocationTask();
    } else {
      await stopAllocationTask();
    }
    await queryClient.invalidateQueries({ queryKey: [TASK_QUERY_KEY] });
  };

  const onUpdateIsCordoned = async (isCordoned: boolean) => {
    const nodes = await fetchNodes();
    const checked = table.getFilteredSelectedRowModel().rows.map((it) => it.original);
    table.toggleAllPageRowsSelected(false);
    for (const nodeGroup of checked) {
      try {
        const targets = nodes.filter((node) => node.groupId === nodeGroup.id);
        const promises = targets.map((node) => updateNode(node.id, { isCordoned }));
        await Promise.all(promises);
      } catch (e) {
        console.error(e);
      }
    }
    await queryClient.invalidateQueries({ queryKey: [NODE_GROUPS_QUERY_KEY] });
    await queryClient.invalidateQueries({ queryKey: [NODES_QUERY_KEY] });
  };

  const onDelete = async () => {
    const checked = table.getFilteredSelectedRowModel().rows.map((it) => it.original);
    table.toggleAllPageRowsSelected(false);
    for (const nodeGroup of checked) {
      try {
        await deleteNodeGroup(nodeGroup.id);
      } catch (e) {
        console.error(e);
      }
    }
    await queryClient.invalidateQueries({ queryKey: [NODE_GROUPS_QUERY_KEY] });
  };

  const onDrain = async () => {
    const checked = table.getFilteredSelectedRowModel().rows.map((it) => it.original);
    table.toggleAllPageRowsSelected(false);
    if (checked.length === 0) {
      return;
    }
    if (checked.length > 1) {
      throw new Error('Only one node group can be drained at a time');
    }
    const target = checked[0];
    await drainNodeGroup(target.id);
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <FilterInput table={table} columnId={'name'} placeholder="Filter names..." />
        <div className="flex gap-1.5 mx-5">
          <NodeGroupCreateButton />
          <Button variant="secondary" className="mr-1" onClick={onDelete}>
            Remove
          </Button>
          <Button variant="secondary" className="ml-1" onClick={() => onUpdateIsCordoned(false)}>
            Activate
          </Button>
          <Button variant="secondary" className="mr-1" onClick={() => onUpdateIsCordoned(true)}>
            Deactivate
          </Button>
          {enabledAllocationTask ? (
            <Button variant="secondary" className="mr-1" onClick={() => onUpdateAllocationTask(false)}>
              StopAllocation
            </Button>
          ) : (
            <Button variant="secondary" className="mr-1" onClick={() => onUpdateAllocationTask(true)}>
              StartAllocation
            </Button>
          )}
          <Button variant="secondary" className="ml-1" disabled={disabledAdjustBtn} onClick={onDrain}>
            Drain
          </Button>
        </div>
        <ColumnSelector table={table} />
      </div>
      <div className="rounded-md border">
        <TableContent table={table} columnLength={nodeGroupColumns.length} />
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <SelectedRowCount table={table} />
        <PageNavigation table={table} />
      </div>
    </div>
  );
}
