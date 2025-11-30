import { useQueryClient } from '@tanstack/react-query';

import { useTable } from '@/shared/model/useTable.ts';
import { Button } from '@/shared/ui/cn/button.tsx';
import { ColumnSelector } from '@/shared/ui/table/ColumnSelector.tsx';
import { FilterInput } from '@/shared/ui/table/FilterInput.tsx';
import { PageNavigation } from '@/shared/ui/table/PageNavigation.tsx';
import { SelectedRowCount } from '@/shared/ui/table/SelectedRowCount.tsx';
import { TableContent } from '@/shared/ui/table/TableContent.tsx';

import { deleteCriterion } from '@/pages/criterion/api/criterion.client.ts';
import { ChzzkCriterionDto } from '@/pages/criterion/api/criterion.schema.ts';
import { CHZZK_CRITERIA_QUERY_KEY } from '@/pages/criterion/config/constants.ts';
import { ChzzkCriterionCreateButton } from '@/pages/criterion/ui/table/ChzzkCriterionCreateButton.tsx';
import { chzzkCriterionColumns } from '@/pages/criterion/ui/table/chzzkCriterionColumns.tsx';

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
