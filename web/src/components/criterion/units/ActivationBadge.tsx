import { CriterionDto } from '@/client/criterion.schema.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { updateCriterionIsDeactivated } from '@/client/criterion.client.ts';
import { CHZZK_CRITERIA_QUERY_KEY, SOOP_CRITERIA_QUERY_KEY } from '@/common/constants.ts';
import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';
import { switchBatchCn } from '@/components/common/styles/common.ts';

export function ActivationBadge({ criterion }: { criterion: CriterionDto }) {
  const queryClient = useQueryClient();
  const content = criterion.isDeactivated ? 'OFF' : 'ON';

  const onClick = async () => {
    await updateCriterionIsDeactivated(criterion.id, !criterion.isDeactivated);
    await queryClient.invalidateQueries({ queryKey: [CHZZK_CRITERIA_QUERY_KEY] });
    await queryClient.invalidateQueries({ queryKey: [SOOP_CRITERIA_QUERY_KEY] });
  };

  return (
    <DefaultAlertDialog onAction={onClick}>
      <div className="justify-self-center">
        <button className="uppercase">
          <Badge variant="default" className={switchBatchCn(!criterion.isDeactivated)}>
            {content}
          </Badge>
        </button>
      </div>
    </DefaultAlertDialog>
  );
}
