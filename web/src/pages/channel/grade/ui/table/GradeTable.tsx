import { useQueryClient } from '@tanstack/react-query';

import { useTable } from '@/shared/model/useTable.ts';
import { Button } from '@/shared/ui/cn/button.tsx';
import { ColumnSelector } from '@/shared/ui/table/ColumnSelector.tsx';
import { FilterInput } from '@/shared/ui/table/FilterInput.tsx';
import { PageNavigation } from '@/shared/ui/table/PageNavigation.tsx';
import { SelectedRowCount } from '@/shared/ui/table/SelectedRowCount.tsx';
import { TableContent } from '@/shared/ui/table/TableContent.tsx';

import { GradeDto } from '@/entities/channel/grade/model/grade.schema.ts';

import { deleteGrade } from '@/features/channel/grade/api/grade.client.ts';
import { GRADES_QUERY_KEY } from '@/features/channel/grade/config/constants.ts';

import { GradeCreateButton } from '@/pages/channel/grade/ui/table/GradeCreateButton.tsx';
import { gradeColumns } from '@/pages/channel/grade/ui/table/columns/gradeColumns.tsx';

export function GradeTable({ data }: { data: GradeDto[] }) {
  const queryClient = useQueryClient();
  const table = useTable(data, gradeColumns, 30);

  const onDelete = async () => {
    const checked = table.getFilteredSelectedRowModel().rows.map((it) => it.original);
    table.toggleAllPageRowsSelected(false);
    for (const grade of checked) {
      try {
        await deleteGrade(grade.id);
      } catch (e) {
        console.error(e);
      }
    }
    await queryClient.invalidateQueries({ queryKey: [GRADES_QUERY_KEY] });
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <FilterInput table={table} columnId={'name'} placeholder="Filter names..." />
        <div className="flex gap-1.5 mx-5">
          <GradeCreateButton />
          <Button variant="secondary" onClick={onDelete}>
            Remove
          </Button>
        </div>
        <ColumnSelector table={table} />
      </div>
      <div className="rounded-md border">
        <TableContent table={table} columnLength={gradeColumns.length} />
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <SelectedRowCount table={table} />
        <PageNavigation table={table} />
      </div>
    </div>
  );
}
