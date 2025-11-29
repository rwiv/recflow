import { TableContent } from '@shared/ui/table/TableContent.tsx';
import { FilterInput } from '@shared/ui/table/FilterInput.tsx';
import { ColumnSelector } from '@shared/ui/table/ColumnSelector.tsx';
import { SelectedRowCount } from '@shared/ui/table/SelectedRowCount.tsx';
import { PageNavigation } from '@shared/ui/table/PageNavigation.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@shared/ui/cn/button.tsx';
import { NodeGroupCreateButton } from '@pages/node/group/table/NodeGroupCreateButton.tsx';
import { nodeGroupColumns } from '@pages/node/group/table/nodeGroupColumns.tsx';
import { drainNodeGroup, deleteNodeGroup } from '@entities/node/group/api/node-group.client.ts';
import { fetchNodes, updateNode } from '@entities/node/node/api/node.client.ts';
import { NodeGroupDto } from '@entities/node/group/api/node-group.schema.ts';
import { useTable } from '@shared/model/useTable.ts';
import { NODE_GROUPS_QUERY_KEY } from '@pages/node/group/config/constants.ts';
import { NODES_QUERY_KEY } from '@pages/node/node/config/constants.ts';

interface NodeGroupTableProps {
  groups: NodeGroupDto[];
}

export function NodeGroupTable({ groups }: NodeGroupTableProps) {
  const queryClient = useQueryClient();
  const table = useTable(groups, nodeGroupColumns);

  const disabledAdjustBtn = table.getFilteredSelectedRowModel().rows.length !== 1;

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
