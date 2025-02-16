import { TableContent } from '@/components/common/table/TableContent.tsx';
import { FilterInput } from '@/components/common/table/FilterInput.tsx';
import { ColumnSelector } from '@/components/common/table/ColumnSelector.tsx';
import { SelectedRowCount } from '@/components/common/table/SelectedRowCount.tsx';
import { PageNavigation } from '@/components/common/table/PageNavigation.tsx';
import { useTable } from '@/components/common/table/useTable.ts';
import { ChzzkCriterionDto } from '@/client/criterion.schema.ts';
import { chzzkCriterionColumns } from '@/components/criterion/chzzkCriterionColumns.tsx';
import { ChzzkCriterionCreateButton } from '@/components/criterion/ChzzkCriterionCreateButton.tsx';
import { deleteCriterion } from '@/client/criterion.client.ts';
import { Button } from '@/components/ui/button.tsx';
import { CHZZK_CRITERIA_QUERY_KEY } from '@/common/constants.ts';
import { useQueryClient } from '@tanstack/react-query';

export function ChzzkCriterionTable({ data }: { data: ChzzkCriterionDto[] }) {
  const queryClient = useQueryClient();
  const table = useTable(data, chzzkCriterionColumns);

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
    await queryClient.invalidateQueries({ queryKey: [CHZZK_CRITERIA_QUERY_KEY] });
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <FilterInput table={table} columnId={'name'} placeholder="Filter names..." />
        <div className="flex gap-1.5 mx-5">
          <ChzzkCriterionCreateButton />
          <Button variant="secondary" onClick={onDelete}>
            Delete
          </Button>
        </div>
        <ColumnSelector table={table} />
      </div>
      <div className="rounded-md border">
        <TableContent table={table} columnLength={chzzkCriterionColumns.length} />
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <SelectedRowCount table={table} />
        <PageNavigation table={table} />
      </div>
    </div>
  );
}
