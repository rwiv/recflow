import { TableContent } from '@/components/common/table/TableContent.tsx';
import { FilterInput } from '@/components/common/table/FilterInput.tsx';
import { ColumnSelector } from '@/components/common/table/ColumnSelector.tsx';
import { SelectedRowCount } from '@/components/common/table/SelectedRowCount.tsx';
import { PageNavigation } from '@/components/common/table/PageNavigation.tsx';
import { useTable } from '@/components/common/table/useTable.ts';
import { LiveRecord } from '@/client/live.types.ts';
import { assignedWebhookNameCid, liveColumns } from '@/components/live/liveColumns.tsx';
import { CommandTools } from '@/components/live/tools/CommandTools.tsx';
import { ScheduleButton } from '@/components/live/tools/ScheduleButton.tsx';

export function LiveTable({ data }: { data: LiveRecord[] }) {
  const table = useTable(data, liveColumns, 15);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex">
          <FilterInput
            table={table}
            columnId={assignedWebhookNameCid}
            placeholder="Filter nodes..."
          />
          <CommandTools table={table} />
        </div>
        <div className="flex gap-2">
          <ColumnSelector table={table} />
          <ScheduleButton />
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
