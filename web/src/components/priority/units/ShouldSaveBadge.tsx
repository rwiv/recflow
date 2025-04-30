import { Badge } from '@/components/ui/badge.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { PRIORITIES_QUERY_KEY } from '@/common/constants.ts';
import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';
import { updatePriority } from '@/client/channel/priority.client.ts';
import { PriorityDto } from '@/client/channel/priority.schema.ts';
import { switchBatchCn } from '@/components/common/styles/common.ts';

export function ShouldSaveBadge({ priority }: { priority: PriorityDto }) {
  const queryClient = useQueryClient();
  const content = priority.shouldSave ? 'ON' : 'OFF';

  const onClick = async () => {
    await updatePriority(priority.id, { shouldSave: !priority.shouldSave });
    await queryClient.invalidateQueries({ queryKey: [PRIORITIES_QUERY_KEY] });
  };

  return (
    <DefaultAlertDialog onAction={onClick}>
      <div className="justify-self-center">
        <button className="uppercase">
          <Badge className={switchBatchCn(priority.shouldSave)}>{content}</Badge>
        </button>
      </div>
    </DefaultAlertDialog>
  );
}
