import { ColumnDef } from '@tanstack/react-table';

import { createSelectColumn, dateColumnDef } from '@/shared/ui/table/column_utils.tsx';

import { NodeGroupDto } from '@/entities/node/group/model/node-group.schema.ts';

import { NodeGroupFieldUpdateForm } from '@/pages/node/group/ui/table/NodeGroupFieldUpdateForm.tsx';

const DEFAULT_WIDTH = '15rem';

const nameColumn: ColumnDef<NodeGroupDto> = {
  accessorKey: 'name',
  header: () => <div className="justify-self-center">Name</div>,
  cell: ({ row }) => <NodeGroupFieldUpdateForm type="name" nodeGroup={row.original} />,
  meta: { header: { width: DEFAULT_WIDTH } },
};

const descriptionColumn: ColumnDef<NodeGroupDto> = {
  accessorKey: 'description',
  header: () => <div className="justify-self-center">Description</div>,
  cell: ({ row }) => <NodeGroupFieldUpdateForm type="description" nodeGroup={row.original} />,
};

export const nodeGroupColumns: ColumnDef<NodeGroupDto>[] = [
  createSelectColumn('select'),
  nameColumn,
  descriptionColumn,
  dateColumnDef<NodeGroupDto>('createdAt', 'CreatedAt', (elem) => new Date(elem.createdAt), DEFAULT_WIDTH),
  dateColumnDef<NodeGroupDto>(
    'updatedAt',
    'UpdatedAt',
    (elem) => (elem.updatedAt ? new Date(elem.updatedAt) : undefined),
    DEFAULT_WIDTH,
  ),
];
