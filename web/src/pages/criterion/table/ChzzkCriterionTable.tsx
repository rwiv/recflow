import { TableContent } from '@shared/ui/table/TableContent.tsx';
import { FilterInput } from '@shared/ui/table/FilterInput.tsx';
import { ColumnSelector } from '@shared/ui/table/ColumnSelector.tsx';
import { SelectedRowCount } from '@shared/ui/table/SelectedRowCount.tsx';
import { PageNavigation } from '@shared/ui/table/PageNavigation.tsx';
import { ChzzkCriterionDto } from '@entities/criterion/api/criterion.schema.ts';
import { chzzkCriterionColumns } from '@pages/criterion/table/chzzkCriterionColumns.tsx';
import { ChzzkCriterionCreateButton } from '@pages/criterion/table/ChzzkCriterionCreateButton.tsx';
import { deleteCriterion } from '@entities/criterion/api/criterion.client.ts';
import { Button } from '@shared/ui/cn/button.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { CHZZK_CRITERIA_QUERY_KEY } from '@pages/criterion/config/constants.ts';
import { useTable } from '@shared/model/useTable.ts';

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
            Remove
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
