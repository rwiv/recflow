import { ColumnDef } from '@tanstack/react-table';
import { createSelectColumn, dateColumnDef } from '@shared/ui/table/column_utils.tsx';
import { TagDto } from '@entities/channel/tag/api/tag.schema.ts';
import { TagFieldUpdateForm } from '@pages/channel/tag/ui/table/TagFieldUpdateForm.tsx';

const DEFAULT_WIDTH = '15rem';

const nameColumn: ColumnDef<TagDto> = {
  accessorKey: 'name',
  header: () => <div className="justify-self-center">Name</div>,
  cell: ({ row }) => <TagFieldUpdateForm type="name" tag={row.original} />,
  meta: { header: { width: DEFAULT_WIDTH } },
};

const descriptionColumn: ColumnDef<TagDto> = {
  accessorKey: 'description',
  header: () => <div className="justify-self-center">Description</div>,
  cell: ({ row }) => <TagFieldUpdateForm type="description" tag={row.original} />,
};

export const tagColumns: ColumnDef<TagDto>[] = [
  createSelectColumn('select'),
  nameColumn,
  descriptionColumn,
  dateColumnDef<TagDto>('createdAt', 'CreatedAt', (elem) => new Date(elem.createdAt), DEFAULT_WIDTH),
  dateColumnDef<TagDto>(
    'updatedAt',
    'UpdatedAt',
    (elem) => (elem.updatedAt ? new Date(elem.updatedAt) : undefined),
    DEFAULT_WIDTH,
  ),
];
