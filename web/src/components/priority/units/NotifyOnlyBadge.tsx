import { Badge } from '@/components/ui/badge.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { PRIORITIES_QUERY_KEY } from '@/common/constants.ts';
import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';
import { updatePriorityShouldNotify } from '@/client/channel/priority.client.ts';
import { PriorityDto } from '@/client/channel/priority.schema.ts';

export function NotifyOnlyBadge({ priority }: { priority: PriorityDto }) {
  const queryClient = useQueryClient();
  const content = priority.shouldNotify ? 'ON' : 'OFF';

  const onClick = async () => {
    await updatePriorityShouldNotify(priority.id, !priority.shouldNotify);
    await queryClient.invalidateQueries({ queryKey: [PRIORITIES_QUERY_KEY] });
  };

  return (
    <DefaultAlertDialog onAction={onClick}>
      <div className="justify-self-center">
        <button className="uppercase">
          <Badge variant={priority.shouldNotify ? 'default' : 'outline'}>{content}</Badge>
        </button>
      </div>
    </DefaultAlertDialog>
  );
}
