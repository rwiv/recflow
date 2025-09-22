import { useQueryClient } from '@tanstack/react-query';
import { SwitchBadge } from '@/components/common/layout/SwitchBadge.tsx';
import { switchBadgeCn1 } from '@/components/common/styles/common.ts';
import { NODES_QUERY_KEY } from '@/common/constants.ts';
import { updateNode } from '@/client/node/node.client.ts';
import { NodeDto } from '@/client/node/node.schema.ts';

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
