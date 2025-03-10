import { Badge } from '@/components/ui/badge.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { PRIORITIES_QUERY_KEY } from '@/common/constants.ts';
import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';
import { switchBatchCn } from '@/components/common/styles/common.ts';
import { updatePriorityShouldNotify } from '@/client/channel/priority.client.ts';
import { PriorityDto } from '@/client/channel/priority.schema.ts';

export function NotifyBadge({ priority }: { priority: PriorityDto }) {
  const queryClient = useQueryClient();
  const content = priority.notifyOnly ? 'ON' : 'OFF';

  const onClick = async () => {
    await updatePriorityShouldNotify(priority.id, !priority.notifyOnly);
    await queryClient.invalidateQueries({ queryKey: [PRIORITIES_QUERY_KEY] });
  };

  return (
    <DefaultAlertDialog onAction={onClick}>
      <div className="justify-self-center">
        <button className="uppercase">
          <Badge variant="default" className={switchBatchCn(priority.notifyOnly)}>
            {content}
          </Badge>
        </button>
      </div>
    </DefaultAlertDialog>
  );
}
