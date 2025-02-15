import { ColumnDef } from '@tanstack/react-table';
import { SoopCriterionDto } from '@/client/criterion.schema.ts';
import { Badge } from '@/components/ui/badge.tsx';

const nameColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'name',
  header: () => <div className="ml-9 my-1">Name</div>,
  cell: ({ row }) => <div className="ml-9 my-1">{row.original.name}</div>,
};

const descriptionColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'description',
  header: () => <div className="ml-9 my-1">Description</div>,
  cell: ({ row }) => <div className="ml-9 my-1">{row.original.description}</div>,
};

const enforceCredsColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'enforceCreds',
  header: () => <div className="ml-9 my-1">enforceCreds</div>,
  cell: ({ row }) => <div className="ml-9 my-1">{row.original.enforceCreds ? 'Yes' : 'No'}</div>,
};

const minUserCntColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'minUserCnt',
  header: () => <div className="ml-9 my-1">minUserCnt</div>,
  cell: ({ row }) => <div className="ml-9 my-1">{row.original.minUserCnt}</div>,
};

const minFollowCntColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'minFollowCnt',
  header: () => <div className="ml-9 my-1">minFollowCnt</div>,
  cell: ({ row }) => <div className="ml-9 my-1">{row.original.minFollowCnt}</div>,
};

type ChzzkKey = 'positiveCates' | 'negativeCates';

function createUnitColumn(key: ChzzkKey, header: string): ColumnDef<SoopCriterionDto> {
  return {
    accessorKey: key,
    header: () => <div className="ml-9 my-1">{header}</div>,
    cell: ({ row }) => (
      <div className="ml-9 my-1">
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
  nameColumn,
  descriptionColumn,
  enforceCredsColumn,
  minUserCntColumn,
  minFollowCntColumn,
  createUnitColumn('positiveCates', 'p_cates'),
  createUnitColumn('positiveCates', 'n_cates'),
];
