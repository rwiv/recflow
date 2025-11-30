import { ColumnDef } from '@tanstack/react-table';
import { SoopCriterionDto } from '@pages/criterion/api/criterion.schema.ts';
import { createSelectColumn } from '@shared/ui/table/column_utils.tsx';
import { CriterionFieldUpdateForm } from '@pages/criterion/table/units/CriterionFieldUpdateForm.tsx';
import {
  CriterionActivationBadge,
  CriterionEnforceCredentialsBadge,
  CriterionLoggingOnlyBadge,
} from '@pages/criterion/table/units/criterion_badges.tsx';
import { CriterionUnit } from '@pages/criterion/table/units/CriterionUnit.tsx';
import { CriterionUnitAddButton } from '@pages/criterion/table/units/CriterionUnitAddButton.tsx';
import { SOOP_CRITERIA_QUERY_KEY } from '@pages/criterion/config/constants.ts';

const NORMAL_WIDTH = '7rem';
const NAME_WIDTH = '10rem';
const USER_CNT_WIDTH = '7rem';

const nameColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'name',
  header: () => <div className="justify-self-center">Name</div>,
  cell: ({ row }) => <div className="justify-self-center">{row.original.name}</div>,
  meta: { header: { width: NAME_WIDTH } },
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

// const adultOnlyColumn: ColumnDef<SoopCriterionDto> = {
//   accessorKey: 'adultOnly',
//   header: () => <div className="justify-self-center">AdultOnly</div>,
//   cell: ({ row }) => <CriterionAdultOnlyBadge criterion={row.original} />,
//   meta: { header: { width: NORMAL_WIDTH } },
// };

// const domesticOnlyColumn: ColumnDef<SoopCriterionDto> = {
//   accessorKey: 'domesticOnly',
//   header: () => <div className="justify-self-center">DomesticOnly</div>,
//   cell: ({ row }) => <CriterionDomesticOnlyBadge criterion={row.original} />,
//   meta: { header: { width: NORMAL_WIDTH } },
// };
//
// const overseasFirstColumn: ColumnDef<SoopCriterionDto> = {
//   accessorKey: 'overseasFirst',
//   header: () => <div className="justify-self-center">OverseasFirst</div>,
//   cell: ({ row }) => <CriterionOverseasFirstBadge criterion={row.original} />,
//   meta: { header: { width: NORMAL_WIDTH } },
// };

const loggingOnlyColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'loggingOnly',
  header: () => <div className="justify-self-center">LoggingOnly</div>,
  cell: ({ row }) => <CriterionLoggingOnlyBadge criterion={row.original} />,
  meta: { header: { width: NORMAL_WIDTH } },
};

const minUserCntColumn: ColumnDef<SoopCriterionDto> = {
  accessorKey: 'minUserCnt',
  header: () => <div className="justify-self-center">Viewers</div>,
  cell: ({ row }) => <CriterionFieldUpdateForm type="minUserCnt" criterion={row.original} />,
  meta: { header: { width: USER_CNT_WIDTH } },
};

type RuleKey =
  | 'positiveTags'
  | 'negativeTags'
  | 'positiveKeywords'
  | 'negativeKeywords'
  | 'positiveCates'
  | 'negativeCates';

type RuleIdKey = 'tagRuleId' | 'keywordRuleId' | 'cateRuleId';

function createUnitColumn(
  ruleKey: RuleKey,
  ruleIdKey: RuleIdKey,
  isPositive: boolean,
  header: string,
): ColumnDef<SoopCriterionDto> {
  return {
    accessorKey: ruleKey,
    header: () => <div className="justify-self-center cursor-pointer">{header}</div>,
    cell: ({ row }) => (
      <div className="justify-self-center space-x-1">
        {row.original[ruleKey].map((unit) => (
          <CriterionUnit key={unit.id} unit={unit} queryKey={SOOP_CRITERIA_QUERY_KEY} />
        ))}
        <CriterionUnitAddButton
          criterionId={row.original.id}
          ruleId={row.original[ruleIdKey]}
          isPositive={isPositive}
          queryKey={SOOP_CRITERIA_QUERY_KEY}
        />
      </div>
    ),
  };
}

export const soopCriterionColumns: ColumnDef<SoopCriterionDto>[] = [
  createSelectColumn('select'),
  nameColumn,
  isDeactivatedColumn,
  enforceCredsColumn,
  // adultOnlyColumn,
  // domesticOnlyColumn,
  // overseasFirstColumn,
  loggingOnlyColumn,
  minUserCntColumn,
  createUnitColumn('positiveTags', 'tagRuleId', true, '+Tags'),
  createUnitColumn('negativeTags', 'tagRuleId', false, '-Tags'),
  createUnitColumn('positiveKeywords', 'keywordRuleId', true, '+Keywords'),
  createUnitColumn('negativeKeywords', 'keywordRuleId', false, '-Keywords'),
  createUnitColumn('positiveCates', 'cateRuleId', true, '+Cates'),
  createUnitColumn('negativeCates', 'cateRuleId', false, '-Cates'),
];
