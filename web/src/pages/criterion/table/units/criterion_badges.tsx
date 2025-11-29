import { CriterionDto } from '@entities/criterion/api/criterion.schema.ts';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { updateCriterion } from '@entities/criterion/api/criterion.client.ts';
import { switchBadgeCn1, switchBadgeCn2 } from '@shared/lib/styles/common.ts';
import { CHZZK_CRITERIA_QUERY_KEY, SOOP_CRITERIA_QUERY_KEY } from '@pages/criterion/config/constants.ts';
import { SwitchBadge } from '@shared/ui/misc/SwitchBadge.tsx';

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
      variant="default"
      onClick={onClick}
      content={criterion.isDeactivated ? 'OFF' : 'ON'}
      className={switchBadgeCn1(!criterion.isDeactivated)}
    />
  );
}

export function CriterionEnforceCredentialsBadge({ criterion }: { criterion: CriterionDto }) {
  const queryClient = useQueryClient();
  const onClick = async () => {
    await updateCriterion(criterion.id, { enforceCreds: !criterion.enforceCreds });
    await refresh(queryClient);
  };
  return (
    <SwitchBadge
      variant="outline"
      onClick={onClick}
      content={criterion.enforceCreds ? 'ON' : 'OFF'}
      className={switchBadgeCn2(criterion.enforceCreds)}
    />
  );
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

export function CriterionLoggingOnlyBadge({ criterion }: { criterion: CriterionDto }) {
  const queryClient = useQueryClient();
  const onClick = async () => {
    await updateCriterion(criterion.id, { loggingOnly: !criterion.loggingOnly });
    await refresh(queryClient);
  };
  return (
    <SwitchBadge
      variant="outline"
      onClick={onClick}
      content={criterion.loggingOnly ? 'ON' : 'OFF'}
      className={switchBadgeCn2(criterion.loggingOnly)}
    />
  );
}
