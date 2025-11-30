import { useQueryClient } from '@tanstack/react-query';
import { switchBadgeCn1 } from '@/shared/lib/styles/common.ts';
import { updateNode } from '@/features/node/node/api/node.client.ts';
import { NodeDto } from '@/entities/node/node/model/node.schema.ts';
import { SwitchBadge } from '@/shared/ui/misc/SwitchBadge.tsx';
import { NODES_QUERY_KEY } from '@/features/node/node/config/constants.ts';

export function NodeCordonedBadge({ node }: { node: NodeDto }) {
  const queryClient = useQueryClient();
  const onClick = async () => {
    await updateNode(node.id, { isCordoned: !node.isCordoned });
    await queryClient.invalidateQueries({ queryKey: [NODES_QUERY_KEY] });
  };
  return (
    <SwitchBadge
      onClick={onClick}
      content={node.isCordoned ? 'OFF' : 'ON'}
      className={switchBadgeCn1(!node.isCordoned)}
    />
  );
}

export function NodeDomesticBadge({ node }: { node: NodeDto }) {
  const queryClient = useQueryClient();
  const onClick = async () => {
    await updateNode(node.id, { isDomestic: !node.isDomestic });
    await queryClient.invalidateQueries({ queryKey: [NODES_QUERY_KEY] });
  };
  return <SwitchBadge variant="default" onClick={onClick} content={node.isDomestic ? 'O' : 'X'} />;
}
