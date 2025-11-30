import { useQueryClient } from '@tanstack/react-query';

import { useTable } from '@/shared/model/useTable.ts';
import { Button } from '@/shared/ui/cn/button.tsx';
import { ColumnSelector } from '@/shared/ui/table/ColumnSelector.tsx';
import { FilterInput } from '@/shared/ui/table/FilterInput.tsx';
import { PageNavigation } from '@/shared/ui/table/PageNavigation.tsx';
import { SelectedRowCount } from '@/shared/ui/table/SelectedRowCount.tsx';
import { TableContent } from '@/shared/ui/table/TableContent.tsx';

import { NodeDto } from '@/entities/node/node/model/node.schema.ts';

import { deleteNode } from '@/features/node/node/api/node.client.ts';
import { NODES_QUERY_KEY } from '@/features/node/node/config/constants.ts';

import { NodeCreateButton } from '@/pages/node/node/ui/table/NodeCreateButton.tsx';
import { nodeColumns } from '@/pages/node/node/ui/table/columns/nodeColumns.tsx';

export function NodeTable({ data }: { data: NodeDto[] }) {
  const queryClient = useQueryClient();
  const table = useTable(data, nodeColumns, 30);

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
