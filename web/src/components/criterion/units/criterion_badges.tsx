import { CriterionDto } from '@/client/criterion/criterion.schema.ts';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { updateCriterion } from '@/client/criterion/criterion.client.ts';
import { CHZZK_CRITERIA_QUERY_KEY, SOOP_CRITERIA_QUERY_KEY } from '@/common/constants.ts';
import { switchBatchCn } from '@/components/common/styles/common.ts';
import { SwitchBadge } from '@/components/common/layout/SwitchBadge.tsx';

async function refresh(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: [CHZZK_CRITERIA_QUERY_KEY] });
  await queryClient.invalidateQueries({ queryKey: [SOOP_CRITERIA_QUERY_KEY] });
}

export function CriterionActivationBadge({ criterion }: { criterion: CriterionDto }) {
  const queryClient = useQueryClient();
  const onClick = async () => {
    await updateCriterion(criterion.id, { isDeactivated: !criterion.isDeactivated });
    await refresh(queryClient);
  };
  return (
    <SwitchBadge
      onClick={onClick}
      content={criterion.isDeactivated ? 'OFF' : 'ON'}
      className={switchBatchCn(!criterion.isDeactivated)}
    />
  );
}

export function CriterionEnforceCredentialsBadge({ criterion }: { criterion: CriterionDto }) {
  const queryClient = useQueryClient();
  const onClick = async () => {
    await updateCriterion(criterion.id, { enforceCreds: !criterion.enforceCreds });
    await refresh(queryClient);
  };
  return <SwitchBadge onClick={onClick} content={criterion.enforceCreds ? 'ON' : 'OFF'} />;
}

export function CriterionDomesticOnlyBadge({ criterion }: { criterion: CriterionDto }) {
  const queryClient = useQueryClient();
  const onClick = async () => {
    await updateCriterion(criterion.id, { domesticOnly: !criterion.domesticOnly });
    await refresh(queryClient);
  };
  return <SwitchBadge onClick={onClick} content={criterion.domesticOnly ? 'ON' : 'OFF'} />;
}

export function CriterionOverseasFirstBadge({ criterion }: { criterion: CriterionDto }) {
  const queryClient = useQueryClient();
  const onClick = async () => {
    await updateCriterion(criterion.id, { overseasFirst: !criterion.overseasFirst });
    await refresh(queryClient);
  };
  return <SwitchBadge onClick={onClick} content={criterion.overseasFirst ? 'ON' : 'OFF'} />;
}

export function CriterionAdultOnlyBadge({ criterion }: { criterion: CriterionDto }) {
  const queryClient = useQueryClient();
  const onClick = async () => {
    await updateCriterion(criterion.id, { adultOnly: !criterion.adultOnly });
    await refresh(queryClient);
  };
  return <SwitchBadge onClick={onClick} content={criterion.adultOnly ? 'ON' : 'OFF'} />;
}
