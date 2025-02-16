import { ColumnDef } from '@tanstack/react-table';
import { SoopCriterionDto } from '@/client/criterion.schema.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { createSelectColumn } from '@/components/common/table/column_utils.tsx';
import { ActivationBadge } from '@/components/criterion/units/ActivationBadge.tsx';
import { EnforceCredentialsBadge } from '@/components/criterion/units/EnforceCredentialsBadge.tsx';

const nameColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'name',
  header: () => <div className="justify-self-center">Name</div>,
  cell: ({ row }) => <div className="justify-self-center">{row.original.name}</div>,
};

const enforceCredsColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'enforceCreds',
  header: () => <div className="justify-self-center">enforceCreds</div>,
  cell: ({ row }) => <EnforceCredentialsBadge criterion={row.original} />,
};

const isDeactivatedColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'isDeactivated',
  header: () => <div className="justify-self-center">Activated</div>,
  cell: ({ row }) => <ActivationBadge criterion={row.original} />,
};

const minUserCntColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'minUserCnt',
  header: () => <div className="justify-self-center">minUserCnt</div>,
  cell: ({ row }) => <div className="justify-self-center">{row.original.minUserCnt}</div>,
};

const minFollowCntColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'minFollowCnt',
  header: () => <div className="justify-self-center">minFollowCnt</div>,
  cell: ({ row }) => <div className="justify-self-center">{row.original.minFollowCnt}</div>,
};

type ChzzkKey = 'positiveCates' | 'negativeCates';

function createUnitColumn(key: ChzzkKey, header: string): ColumnDef<SoopCriterionDto> {
  return {
    accessorKey: key,
    header: () => <div className="justify-self-center">{header}</div>,
    cell: ({ row }) => (
      <div className="justify-self-center space-x-1">
        {row.original[key].map((value, i) => (
          <Badge key={i} className="cursor-default">
            {value}
          </Badge>
        ))}
      </div>
    ),
  };
}

export const soopCriterionColumns: ColumnDef<SoopCriterionDto>[] = [
  createSelectColumn('select'),
  nameColumn,
  enforceCredsColumn,
  isDeactivatedColumn,
  minUserCntColumn,
  minFollowCntColumn,
  createUnitColumn('positiveCates', 'p_cates'),
  createUnitColumn('negativeCates', 'n_cates'),
];
