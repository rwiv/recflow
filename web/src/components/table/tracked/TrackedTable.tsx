import { TableContent } from '@/components/table/common/TableContent.tsx';
import { FilterInput } from '@/components/table/common/FilterInput.tsx';
import { ColumnSelector } from '@/components/table/common/ColumnSelector.tsx';
import { SelectedRowCount } from '@/components/table/common/SelectedRowCount.tsx';
import { PageNavigation } from '@/components/table/common/PageNavigation.tsx';
import { useTable } from '@/components/table/common/useTable.ts';
import { TrackedRecord } from '@/client/types.ts';
import {
  assignedWebhookNameCid,
  trackedColumns,
} from '@/components/table/tracked/trackedColumns.tsx';
import { CommandTools } from '@/components/table/tracked/cmdtools/CommandTools.tsx';

export function TrackedTable({ data }: { data: TrackedRecord[] }) {
  const table = useTable(data, trackedColumns, 15);

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <FilterInput
          table={table}
          columnId={assignedWebhookNameCid}
          placeholder="Filter webhooks..."
        />
        <CommandTools table={table} />
        <ColumnSelector table={table} />
      </div>
      <div className="rounded-md border">
        <TableContent table={table} columnLength={trackedColumns.length} />
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <SelectedRowCount table={table} />
        <PageNavigation table={table} />
      </div>
    </div>
  );
}
