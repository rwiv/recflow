import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@shared/ui/cn/button.tsx';
import {
  TableContent,
  FilterInput,
  ColumnSelector,
  SelectedRowCount,
  PageNavigation,
} from '@shared/ui/table';
import { useTable } from '@shared/model';
import { TagDto, deleteTag, TAGS_QUERY_KEY } from '@entities/channel/tag';
import { tagColumns } from './tagColumns.tsx';
import { TagCreateButton } from './TagCreateButton.tsx';

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
