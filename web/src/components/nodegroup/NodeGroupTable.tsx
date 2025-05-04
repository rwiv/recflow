import { TableContent } from '@/components/common/table/TableContent.tsx';
import { FilterInput } from '@/components/common/table/FilterInput.tsx';
import { ColumnSelector } from '@/components/common/table/ColumnSelector.tsx';
import { SelectedRowCount } from '@/components/common/table/SelectedRowCount.tsx';
import { PageNavigation } from '@/components/common/table/PageNavigation.tsx';
import { useTable } from '@/components/common/table/useTable.ts';
import { useQueryClient } from '@tanstack/react-query';
import { NODE_GROUPS_QUERY_KEY } from '@/common/constants.ts';
import { Button } from '@/components/ui/button.tsx';
import { NodeGroupCreateButton } from '@/components/nodegroup/NodeGroupCreateButton.tsx';
import { NodeGroupDto } from '@/client/node/node.schema.ts';
import { nodeGroupColumns } from '@/components/nodegroup/nodeGroupColumns.tsx';
import { adjustNodeGroup, deleteNodeGroup } from '@/client/node/node-group.client.ts';

export function NodeGroupTable({ data }: { data: NodeGroupDto[] }) {
  const queryClient = useQueryClient();
  const table = useTable(data, nodeGroupColumns);

  const disabledAdjustBtn = table.getFilteredSelectedRowModel().rows.length !== 1;

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

  const onAdjust = async (isDrain: boolean) => {
    const checked = table.getFilteredSelectedRowModel().rows.map((it) => it.original);
    table.toggleAllPageRowsSelected(false);
    if (checked.length === 0) {
      return;
    }
    if (checked.length > 1) {
      throw new Error('Only one node group can be drained at a time');
    }
    const target = checked[0];
    await adjustNodeGroup(target.id, isDrain);
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <FilterInput table={table} columnId={'name'} placeholder="Filter names..." />
        <div className="flex gap-1.5 mx-5">
          <NodeGroupCreateButton />
          <Button variant="secondary" onClick={onDelete}>
            Remove
          </Button>
          <Button variant="secondary" disabled={disabledAdjustBtn} onClick={() => onAdjust(true)}>
            Drain
          </Button>
          <Button variant="secondary" disabled={disabledAdjustBtn} onClick={() => onAdjust(false)}>
            Rebalance
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
