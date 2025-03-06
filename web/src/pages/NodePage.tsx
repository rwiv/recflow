import { useQuery } from '@tanstack/react-query';
import { NodeTable } from '@/components/node/NodeTable.tsx';
import { NODES_QUERY_KEY } from '@/common/constants.ts';
import { NodeDto } from '@/client/node/node.schema.ts';
import { fetchNodes } from '@/client/node/node.client.ts';
import { PageHeaderTab } from '@/components/common/layout/PageHeaderTab.tsx';

export function NodePage() {
  const { data: nodes } = useQuery<NodeDto[]>({
    queryKey: [NODES_QUERY_KEY],
    queryFn: fetchNodes,
  });

  return (
    <div>
      <PageHeaderTab node />
      <div className="mx-10 my-3">{nodes && <NodeTable data={nodes} />}</div>
    </div>
  );
}
