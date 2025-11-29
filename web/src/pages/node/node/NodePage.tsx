import { useQuery } from '@tanstack/react-query';
import { NodeDto } from '@entities/node/node/api/node.schema.ts';
import { fetchNodes } from '@entities/node/node/api/node.client.ts';
import { PageHeaderTab } from '@widgets/header';
import { NodeTable } from './table';
import { NODES_QUERY_KEY } from '@shared/config';

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
