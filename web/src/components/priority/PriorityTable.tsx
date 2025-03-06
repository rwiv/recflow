import { TableContent } from '@/components/common/table/TableContent.tsx';
import { FilterInput } from '@/components/common/table/FilterInput.tsx';
import { ColumnSelector } from '@/components/common/table/ColumnSelector.tsx';
import { SelectedRowCount } from '@/components/common/table/SelectedRowCount.tsx';
import { PageNavigation } from '@/components/common/table/PageNavigation.tsx';
import { useTable } from '@/components/common/table/useTable.ts';
import { useQueryClient } from '@tanstack/react-query';
import { PRIORITIES_QUERY_KEY } from '@/common/constants.ts';
import { Button } from '@/components/ui/button.tsx';
import { priorityColumns } from '@/components/priority/priorityColumns.tsx';
import { deletePriority } from '@/client/channel/priority.client.ts';
import { PriorityDto } from '@/client/channel/priority.schema.ts';
import { PriorityCreateButton } from '@/components/priority/PriorityCreateButton.tsx';

export function PriorityTable({ data }: { data: PriorityDto[] }) {
  const queryClient = useQueryClient();
  const table = useTable(data, priorityColumns);

  const onDelete = async () => {
    const checked = table.getFilteredSelectedRowModel().rows.map((it) => it.original);
    table.toggleAllPageRowsSelected(false);
    for (const pri of checked) {
      try {
        await deletePriority(pri.id);
      } catch (e) {
        console.error(e);
      }
    }
    await queryClient.invalidateQueries({ queryKey: [PRIORITIES_QUERY_KEY] });
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <FilterInput table={table} columnId={'name'} placeholder="Filter names..." />
        <div className="flex gap-1.5 mx-5">
          <PriorityCreateButton />
          <Button variant="secondary" onClick={onDelete}>
            Remove
          </Button>
        </div>
        <ColumnSelector table={table} />
      </div>
      <div className="rounded-md border">
        <TableContent table={table} columnLength={priorityColumns.length} />
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <SelectedRowCount table={table} />
        <PageNavigation table={table} />
      </div>
    </div>
  );
}
