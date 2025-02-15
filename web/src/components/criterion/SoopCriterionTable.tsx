import { TableContent } from '@/components/common/table/TableContent.tsx';
import { FilterInput } from '@/components/common/table/FilterInput.tsx';
import { ColumnSelector } from '@/components/common/table/ColumnSelector.tsx';
import { SelectedRowCount } from '@/components/common/table/SelectedRowCount.tsx';
import { PageNavigation } from '@/components/common/table/PageNavigation.tsx';
import { useTable } from '@/components/common/table/useTable.ts';
import { nameCid, nodeColumns } from '@/components/node/nodeColumns.tsx';
import { SoopCriterionDto } from '@/client/criterion.schema.ts';
import { soopCriterionColumns } from '@/components/criterion/soopCriterionColumns.tsx';
import { SoopCriterionCreateButton } from '@/components/criterion/SoopCriterionCreateButton.tsx';

export function SoopCriterionTable({ data }: { data: SoopCriterionDto[] }) {
  const table = useTable(data, soopCriterionColumns);

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <FilterInput table={table} columnId={nameCid} placeholder="Filter names..." />
        <div className="flex gap-1.5 mx-5">
          <SoopCriterionCreateButton />
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
