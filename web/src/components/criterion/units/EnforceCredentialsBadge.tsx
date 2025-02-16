import { CriterionDto } from '@/client/criterion.schema.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { updateCriterionEnforceCreds } from '@/client/criterion.client.ts';
import { CHZZK_CRITERIA_QUERY_KEY, SOOP_CRITERIA_QUERY_KEY } from '@/common/constants.ts';
import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';

export function EnforceCredentialsBadge({
  criterion,
  className,
}: {
  criterion: CriterionDto;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const content = criterion.enforceCreds ? 'ON' : 'OFF';

  const onClick = async () => {
    await updateCriterionEnforceCreds(criterion.id, !criterion.enforceCreds);
    await queryClient.invalidateQueries({ queryKey: [CHZZK_CRITERIA_QUERY_KEY] });
    await queryClient.invalidateQueries({ queryKey: [SOOP_CRITERIA_QUERY_KEY] });
  };

  return (
    <DefaultAlertDialog onAction={onClick}>
      <div className="justify-self-center">
        <button className="uppercase">
          <Badge variant="default" className={className}>
            {content}
          </Badge>
        </button>
      </div>
    </DefaultAlertDialog>
  );
}
