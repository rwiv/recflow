import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/ui/cn/button.tsx';
import { TagDto } from '@/entities/channel/tag/api/tag.schema.ts';
import { useTable } from '@/shared/model/useTable.ts';
import { deleteTag } from '@/entities/channel/tag/api/tag.client.ts';
import { FilterInput } from '@/shared/ui/table/FilterInput.tsx';
import { ColumnSelector } from '@/shared/ui/table/ColumnSelector.tsx';
import { TableContent } from '@/shared/ui/table/TableContent.tsx';
import { SelectedRowCount } from '@/shared/ui/table/SelectedRowCount.tsx';
import { PageNavigation } from '@/shared/ui/table/PageNavigation.tsx';
import { TAGS_QUERY_KEY } from '@/pages/channel/tag/config/constants.ts';
import { TagCreateButton } from '@/pages/channel/tag/ui/table/TagCreateButton.tsx';
import { tagColumns } from '@/pages/channel/tag/ui/table/tagColumns.tsx';

export function TagTable({ data }: { data: TagDto[] }) {
  const queryClient = useQueryClient();
  const table = useTable(data, tagColumns, 30);

  const onDelete = async () => {
    const checked = table.getFilteredSelectedRowModel().rows.map((it) => it.original);
    table.toggleAllPageRowsSelected(false);
    for (const tag of checked) {
      try {
        await deleteTag(tag.id);
      } catch (e) {
        console.error(e);
      }
    }
    await queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <FilterInput table={table} columnId={'name'} placeholder="Filter names..." />
        <div className="flex gap-1.5 mx-5">
          <TagCreateButton />
          <Button variant="secondary" onClick={onDelete}>
            Remove
          </Button>
        </div>
        <ColumnSelector table={table} />
      </div>
      <div className="rounded-md border">
        <TableContent table={table} columnLength={tagColumns.length} />
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <SelectedRowCount table={table} />
        <PageNavigation table={table} />
      </div>
    </div>
  );
}
