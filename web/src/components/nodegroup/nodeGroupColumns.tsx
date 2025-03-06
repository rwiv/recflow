import { ColumnDef } from '@tanstack/react-table';
import { createSelectColumn } from '@/components/common/table/column_utils.tsx';
import { NodeGroupDto } from '@/client/node/node.schema.ts';
import { NodeGroupFieldUpdateForm } from '@/components/nodegroup/NodeGroupFieldUpdateForm.tsx';

const EDITABLE_WIDTH = '15rem';

const nameColumn: ColumnDef<NodeGroupDto> = {
  accessorKey: 'name',
  header: () => <div className="justify-self-center">Name</div>,
  cell: ({ row }) => <NodeGroupFieldUpdateForm type="name" nodeGroup={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const tierColumn: ColumnDef<NodeGroupDto> = {
  accessorKey: 'tier',
  header: () => <div className="justify-self-center">Tier</div>,
  cell: ({ row }) => <NodeGroupFieldUpdateForm type="tier" nodeGroup={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const descriptionColumn: ColumnDef<NodeGroupDto> = {
  accessorKey: 'description',
  header: () => <div className="justify-self-center">Description</div>,
  cell: ({ row }) => <NodeGroupFieldUpdateForm type="description" nodeGroup={row.original} />,
};

export const nodeGroupColumns: ColumnDef<NodeGroupDto>[] = [
  createSelectColumn('select'),
  nameColumn,
  tierColumn,
  descriptionColumn,
];
