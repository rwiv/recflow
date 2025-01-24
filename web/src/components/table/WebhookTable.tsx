import { TableContent } from '@/components/table/common/TableContent.tsx';
import { FilterInput } from '@/components/table/common/FilterInput.tsx';
import { ColumnSelector } from '@/components/table/common/ColumnSelector.tsx';
import { SelectedRowCount } from '@/components/table/common/SelectedRowCount.tsx';
import { PageNavigation } from '@/components/table/common/PageNavigation.tsx';
import { useTable } from '@/components/table/common/useTable.ts';
import { WebhookState } from '@/client/types.ts';
import {
  webhookColumns,
  webhookTypeCid,
} from '@/components/table/webhookColumns.tsx';

export function WebhookTable({ data }: { data: WebhookState[] }) {
  const table = useTable(data, webhookColumns);

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <FilterInput
          table={table}
          columnId={webhookTypeCid}
          placeholder="Filter webhooks..."
        />
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
