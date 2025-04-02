import { ColumnDef } from '@tanstack/react-table';
import { SoopCriterionDto } from '@/client/criterion/criterion.schema.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { createSelectColumn } from '@/components/common/table/column_utils.tsx';
import { CriterionFieldUpdateForm } from '@/components/criterion/units/CriterionFieldUpdateForm.tsx';
import {
  CriterionActivationBadge,
  CriterionAdultOnlyBadge,
  CriterionDomesticOnlyBadge,
  CriterionEnforceCredentialsBadge,
  CriterionOverseasFirstBadge,
} from '@/components/criterion/units/criterion_badges.tsx';

const NORMAL_WIDTH = '6rem';
const EDITABLE_WIDTH = '6rem';

const nameColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'name',
  header: () => <div className="justify-self-center">Name</div>,
  cell: ({ row }) => <div className="justify-self-center">{row.original.name}</div>,
  meta: { header: { width: NORMAL_WIDTH } },
};

const isDeactivatedColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'isDeactivated',
  header: () => <div className="justify-self-center">Activated</div>,
  cell: ({ row }) => <CriterionActivationBadge criterion={row.original} />,
  meta: { header: { width: NORMAL_WIDTH } },
};

const enforceCredsColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'enforceCreds',
  header: () => <div className="justify-self-center">CredentialsOnly</div>,
  cell: ({ row }) => <CriterionEnforceCredentialsBadge criterion={row.original} />,
  meta: { header: { width: NORMAL_WIDTH } },
};

const adultOnlyColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'adultOnly',
  header: () => <div className="justify-self-center">AdultOnly</div>,
  cell: ({ row }) => <CriterionAdultOnlyBadge criterion={row.original} />,
  meta: { header: { width: NORMAL_WIDTH } },
};

const domesticOnlyColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'domesticOnly',
  header: () => <div className="justify-self-center">DomesticOnly</div>,
  cell: ({ row }) => <CriterionDomesticOnlyBadge criterion={row.original} />,
  meta: { header: { width: NORMAL_WIDTH } },
};

const overseasFirstColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'overseasFirst',
  header: () => <div className="justify-self-center">OverseasFirst</div>,
  cell: ({ row }) => <CriterionOverseasFirstBadge criterion={row.original} />,
  meta: { header: { width: NORMAL_WIDTH } },
};

const sufficientUserCntColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'sufficientUserCnt',
  header: () => <div className="justify-self-center">SUC</div>,
  cell: ({ row }) => <CriterionFieldUpdateForm type="sufficientUserCnt" criterion={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const minUserCntColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'minUserCnt',
  header: () => <div className="justify-self-center">MUC</div>,
  cell: ({ row }) => <CriterionFieldUpdateForm type="minUserCnt" criterion={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const minFollowCntColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'minFollowCnt',
  header: () => <div className="justify-self-center">MFC</div>,
  cell: ({ row }) => <CriterionFieldUpdateForm type="minFollowCnt" criterion={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const qualifyingUserCntColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'qualifyingUserCnt',
  header: () => <div className="justify-self-center">QUC</div>,
  cell: ({ row }) => <CriterionFieldUpdateForm type="qualifyingUserCnt" criterion={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const qualifyingFollowCntColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'qualifyingFollowCnt',
  header: () => <div className="justify-self-center">QFC</div>,
  cell: ({ row }) => <CriterionFieldUpdateForm type="qualifyingFollowCnt" criterion={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

type RuleKey =
  | 'positiveTags'
  | 'negativeTags'
  | 'positiveKeywords'
  | 'negativeKeywords'
  | 'positiveCates'
  | 'negativeCates';

function createUnitColumn(key: RuleKey, header: string): ColumnDef<SoopCriterionDto> {
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
  isDeactivatedColumn,
  enforceCredsColumn,
  adultOnlyColumn,
  domesticOnlyColumn,
  overseasFirstColumn,
  sufficientUserCntColumn,
  minUserCntColumn,
  minFollowCntColumn,
  qualifyingUserCntColumn,
  qualifyingFollowCntColumn,
  createUnitColumn('positiveTags', 'p_tags'),
  createUnitColumn('negativeTags', 'n_tags'),
  createUnitColumn('positiveKeywords', 'p_keywords'),
  createUnitColumn('negativeKeywords', 'n_keywords'),
  createUnitColumn('positiveCates', 'p_cates'),
  createUnitColumn('negativeCates', 'n_cates'),
];
