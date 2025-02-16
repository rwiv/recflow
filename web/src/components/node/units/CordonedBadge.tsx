import { Badge } from '@/components/ui/badge.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { NODES_QUERY_KEY } from '@/common/constants.ts';
import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';
import { NodeDto } from '@/client/node.schema.ts';
import { updateNodeIsCordoned } from '@/client/node.client.ts';
import { switchBatchCn } from '@/components/common/styles/common.ts';

export function CordonedBadge({ node }: { node: NodeDto }) {
  const queryClient = useQueryClient();
  const content = node.isCordoned ? 'OFF' : 'ON';

  const onClick = async () => {
    await updateNodeIsCordoned(node.id, !node.isCordoned);
    await queryClient.invalidateQueries({ queryKey: [NODES_QUERY_KEY] });
  };

  return (
    <DefaultAlertDialog onAction={onClick}>
      <div className="justify-self-center">
        <button className="uppercase">
          <Badge variant="default" className={switchBatchCn(!node.isCordoned)}>
            {content}
          </Badge>
        </button>
      </div>
    </DefaultAlertDialog>
  );
}
