import { TableContent } from '@/components/common/table/TableContent.tsx';
import { FilterInput } from '@/components/common/table/FilterInput.tsx';
import { ColumnSelector } from '@/components/common/table/ColumnSelector.tsx';
import { SelectedRowCount } from '@/components/common/table/SelectedRowCount.tsx';
import { PageNavigation } from '@/components/common/table/PageNavigation.tsx';
import { useTable } from '@/components/common/table/useTable.ts';
import { SoopCriterionDto } from '@/client/criterion/criterion.schema.ts';
import { soopCriterionColumns } from '@/components/criterion/soopCriterionColumns.tsx';
import { SoopCriterionCreateButton } from '@/components/criterion/SoopCriterionCreateButton.tsx';
import { Button } from '@/components/ui/button.tsx';
import { deleteCriterion } from '@/client/criterion/criterion.client.ts';
import { useQueryClient } from '@tanstack/react-query';
import { SOOP_CRITERIA_QUERY_KEY } from '@/common/constants.ts';

export function SoopCriterionTable({ data }: { data: SoopCriterionDto[] }) {
  const queryClient = useQueryClient();
  const table = useTable(data, soopCriterionColumns);

  const onDelete = async () => {
    const checked = table.getFilteredSelectedRowModel().rows.map((it) => it.original);
    table.toggleAllPageRowsSelected(false);
    for (const criterion of checked) {
      try {
        await deleteCriterion(criterion.id);
      } catch (e) {
        console.error(e);
      }
    }
    await queryClient.invalidateQueries({ queryKey: [SOOP_CRITERIA_QUERY_KEY] });
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <FilterInput table={table} columnId={'name'} placeholder="Filter names..." />
        <div className="flex gap-1.5 mx-5">
          <SoopCriterionCreateButton />
          <Button variant="secondary" onClick={onDelete}>
            Delete
          </Button>
        </div>
        <ColumnSelector table={table} />
      </div>
      <div className="rounded-md border">
        <TableContent table={table} columnLength={soopCriterionColumns.length} />
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <SelectedRowCount table={table} />
        <PageNavigation table={table} />
      </div>
    </div>
  );
}
