import { ColumnDef } from '@tanstack/react-table';
import { createSelectColumn } from '@/components/common/table/column_utils.tsx';
import { TagDto } from '@/client/channel/tag.schema.ts';
import { TagFieldUpdateForm } from '@/components/tag/TagFieldUpdateForm.tsx';

const EDITABLE_WIDTH = '15rem';

const nameColumn: ColumnDef<TagDto> = {
  accessorKey: 'name',
  header: () => <div className="justify-self-center">Name</div>,
  cell: ({ row }) => <TagFieldUpdateForm type="name" tag={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const descriptionColumn: ColumnDef<TagDto> = {
  accessorKey: 'description',
  header: () => <div className="justify-self-center">Description</div>,
  cell: ({ row }) => <TagFieldUpdateForm type="description" tag={row.original} />,
};

export const tagColumns: ColumnDef<TagDto>[] = [createSelectColumn('select'), nameColumn, descriptionColumn];
