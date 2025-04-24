import { ColumnDef } from '@tanstack/react-table';
import { NodeDto } from '@/client/node/node.schema.ts';
import { createSelectColumn } from '@/components/common/table/column_utils.tsx';
import { NodeGroupBadge } from '@/components/node/units/GroupUpdateDialog.tsx';
import { NodeFieldUpdateForm } from '@/components/node/units/NodeFieldUpdateForm.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { NodeCordonedBadge, NodeDomesticBadge } from '@/components/node/units/node_badges.tsx';

const EDITABLE_WIDTH = '12rem';
const SWITCH_SIDTH = '8rem';

const nameColumn: ColumnDef<NodeDto> = {
  accessorKey: 'name',
  header: () => <div className="justify-self-center">Name</div>,
  cell: ({ row }) => <NodeFieldUpdateForm type="name" node={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const cordonedColumn: ColumnDef<NodeDto> = {
  accessorKey: 'isCordoned',
  header: () => <div className="justify-self-center">Activated</div>,
  cell: ({ row }) => <NodeCordonedBadge node={row.original} />,
  meta: { header: { width: SWITCH_SIDTH } },
};

const isDomesticColumn: ColumnDef<NodeDto> = {
  accessorKey: 'isDomestic',
  header: () => <div className="justify-self-center">Domestic</div>,
  cell: ({ row }) => <NodeDomesticBadge node={row.original} />,
  meta: { header: { width: SWITCH_SIDTH } },
};

const failureCntColumn: ColumnDef<NodeDto> = {
  accessorKey: 'failureCnt',
  header: () => <div className="justify-self-center">Failure</div>,
  cell: ({ row }) => <NodeFieldUpdateForm type="failureCnt" node={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const groupColumn: ColumnDef<NodeDto> = {
  accessorKey: 'group',
  header: () => <div className="justify-self-center">Group</div>,
  cell: ({ row }) => <NodeGroupBadge node={row.original} />,
  meta: { header: { width: SWITCH_SIDTH } },
};

const nodeTypeColumn: ColumnDef<NodeDto> = {
  accessorKey: 'type',
  header: () => <div className="justify-self-center">Type</div>,
  cell: ({ row }) => {
    return (
      <div className="justify-self-center">
        <button>
          <Badge variant="secondary">{row.original.type.name}</Badge>
        </button>
      </div>
    );
  },
  meta: { header: { width: SWITCH_SIDTH } },
};

const weightColumn: ColumnDef<NodeDto> = {
  accessorKey: 'weight',
  header: () => <div className="justify-self-center">Weight</div>,
  cell: ({ row }) => <NodeFieldUpdateForm type="weight" node={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const capacityColumn: ColumnDef<NodeDto> = {
  accessorKey: 'capacity',
  header: () => <div className="justify-self-center">Capacity</div>,
  cell: ({ row }) => <NodeFieldUpdateForm type="capacity" node={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const endpointColumn: ColumnDef<NodeDto> = {
  accessorKey: 'endpoint',
  header: () => <div className="justify-self-center">Endpoint</div>,
  cell: ({ row }) => <NodeFieldUpdateForm type="endpoint" node={row.original} />,
};

export const nodeColumns: ColumnDef<NodeDto>[] = [
  createSelectColumn('select'),
  nameColumn,
  cordonedColumn,
  isDomesticColumn,
  groupColumn,
  nodeTypeColumn,
  weightColumn,
  capacityColumn,
  failureCntColumn,
  endpointColumn,
];
