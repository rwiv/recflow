import { TableContent } from '@/components/common/table/TableContent.tsx';
import { ColumnSelector } from '@/components/common/table/ColumnSelector.tsx';
import { SelectedRowCount } from '@/components/common/table/SelectedRowCount.tsx';
import { PageNavigation } from '@/components/common/table/PageNavigation.tsx';
import { useTable } from '@/components/common/table/useTable.ts';
import { LiveDto } from '@/client/live.types.ts';
import { liveColumns } from '@/components/live/liveColumns.tsx';
import { LiveRemoveButton } from '@/components/live/LiveRemoveButton.tsx';
import { FilterInput } from '@/components/common/table/FilterInput.tsx';
import { LiveCreateButton } from '@/components/live/LiveCreateButton.tsx';

export function LiveTable({ data }: { data: LiveDto[] }) {
  const table = useTable(data, liveColumns, 15);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex">
          <FilterInput table={table} columnId={'node'} placeholder="Filter nodes..." />
          <div className="flex gap-1.5 mx-5">
            <LiveCreateButton />
            <LiveRemoveButton table={table} />
          </div>
        </div>
        <div className="flex gap-2">
          <ColumnSelector table={table} />
        </div>
      </div>
      <div className="rounded-md border">
        <TableContent table={table} columnLength={liveColumns.length} />
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <SelectedRowCount table={table} />
        <PageNavigation table={table} />
      </div>
    </div>
  );
}
