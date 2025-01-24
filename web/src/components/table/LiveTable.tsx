import { TableContent } from '@/components/table/common/TableContent.tsx';
import { FilterInput } from '@/components/table/common/FilterInput.tsx';
import { ColumnSelector } from '@/components/table/common/ColumnSelector.tsx';
import { SelectedRowCount } from '@/components/table/common/SelectedRowCount.tsx';
import { PageNavigation } from '@/components/table/common/PageNavigation.tsx';
import { useTable } from '@/components/table/common/useTable.ts';
import { ExitCmd, LiveInfo } from '@/client/types.ts';
import {
  assignedWebhookNameCid,
  liveColumns,
} from '@/components/table/liveColumns.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { deleteLive } from '@/client/client.ts';

export function LiveTable({ data }: { data: LiveInfo[] }) {
  const table = useTable(data, liveColumns);
  const queryClient = useQueryClient();

  const remove = async (cmd: ExitCmd) => {
    const checked = table
      .getFilteredSelectedRowModel()
      .rows.map((it) => it.original);
    const res = await Promise.all(
      checked.map((live) => deleteLive(live.channelId, live.type, cmd)),
    );
    table.toggleAllPageRowsSelected(false);
    await queryClient.invalidateQueries({ queryKey: ['lives'] });
    return res;
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <FilterInput
          table={table}
          columnId={assignedWebhookNameCid}
          placeholder="Filter webhooks..."
        />
        <div className="flex gap-1.5 mx-5">
          <Button variant="secondary">Create</Button>
          <Button variant="secondary" onClick={() => remove('delete')}>
            Delete
          </Button>
          <Button variant="secondary" onClick={() => remove('cancel')}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => remove('finish')}>
            Finish
          </Button>
        </div>
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
