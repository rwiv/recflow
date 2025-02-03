import { TableContent } from '@/components/common/table/TableContent.tsx';
import { FilterInput } from '@/components/common/table/FilterInput.tsx';
import { ColumnSelector } from '@/components/common/table/ColumnSelector.tsx';
import { SelectedRowCount } from '@/components/common/table/SelectedRowCount.tsx';
import { PageNavigation } from '@/components/common/table/PageNavigation.tsx';
import { useTable } from '@/components/common/table/useTable.ts';
import { LiveRecord } from '@/client/types.ts';
import { assignedWebhookNameCid, liveColumns } from '@/components/live/liveColumns.tsx';
import { CommandTools } from '@/components/live/cmdtools/CommandTools.tsx';

export function LiveTable({ data }: { data: LiveRecord[] }) {
  const table = useTable(data, liveColumns, 15);

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <FilterInput
          table={table}
          columnId={assignedWebhookNameCid}
          placeholder="Filter nodes..."
        />
        <CommandTools table={table} />
        <ColumnSelector table={table} />
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
