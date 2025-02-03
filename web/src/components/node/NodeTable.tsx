import { TableContent } from '@/components/common/table/TableContent.tsx';
import { FilterInput } from '@/components/common/table/FilterInput.tsx';
import { ColumnSelector } from '@/components/common/table/ColumnSelector.tsx';
import { SelectedRowCount } from '@/components/common/table/SelectedRowCount.tsx';
import { PageNavigation } from '@/components/common/table/PageNavigation.tsx';
import { useTable } from '@/components/common/table/useTable.ts';
import { NodeRecord } from '@/client/types.ts';
import { nameCid, webhookColumns } from '@/components/node/webhookColumns.tsx';

export function NodeTable({ data }: { data: NodeRecord[] }) {
  const table = useTable(data, webhookColumns);

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <FilterInput table={table} columnId={nameCid} placeholder="Filter names..." />
        <ColumnSelector table={table} />
      </div>
      <div className="rounded-md border">
        <TableContent table={table} columnLength={webhookColumns.length} />
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <SelectedRowCount table={table} />
        <PageNavigation table={table} />
      </div>
    </div>
  );
}
