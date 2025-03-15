import { TableContent } from '@/components/common/table/TableContent.tsx';
import { FilterInput } from '@/components/common/table/FilterInput.tsx';
import { ColumnSelector } from '@/components/common/table/ColumnSelector.tsx';
import { SelectedRowCount } from '@/components/common/table/SelectedRowCount.tsx';
import { PageNavigation } from '@/components/common/table/PageNavigation.tsx';
import { useTable } from '@/components/common/table/useTable.ts';
import { nodeColumns } from '@/components/node/nodeColumns.tsx';
import { NodeDto } from '@/client/node/node.schema.ts';
import { NodeCreateButton } from '@/components/node/NodeCreateButton.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { NODES_QUERY_KEY } from '@/common/constants.ts';
import { deleteNode } from '@/client/node/node.client.ts';
import { Button } from '@/components/ui/button.tsx';

export function NodeTable({ data }: { data: NodeDto[] }) {
  const queryClient = useQueryClient();
  const table = useTable(data, nodeColumns, 20);

  const onDelete = async () => {
    const checked = table.getFilteredSelectedRowModel().rows.map((it) => it.original);
    table.toggleAllPageRowsSelected(false);
    for (const node of checked) {
      try {
        await deleteNode(node.id);
      } catch (e) {
        console.error(e);
      }
    }
    await queryClient.invalidateQueries({ queryKey: [NODES_QUERY_KEY] });
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <FilterInput table={table} columnId={'name'} placeholder="Filter names..." />
        <div className="flex gap-1.5 mx-5">
          <NodeCreateButton />
          <Button variant="secondary" onClick={onDelete}>
            Remove
          </Button>
        </div>
        <ColumnSelector table={table} />
      </div>
      <div className="rounded-md border">
        <TableContent table={table} columnLength={nodeColumns.length} />
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <SelectedRowCount table={table} />
        <PageNavigation table={table} />
      </div>
    </div>
  );
}
