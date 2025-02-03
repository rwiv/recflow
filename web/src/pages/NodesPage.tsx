import { NodeRecord } from '@/client/types.ts';
import { fetchNodes } from '@/client/client.ts';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { TabButton, TabList } from '@/components/common/layout/Tab.tsx';
import { NodeTable } from '@/components/node/NodeTable.tsx';

export function NodesPage() {
  const { data: nodes } = useQuery<NodeRecord[]>({
    queryKey: ['nodes'],
    queryFn: fetchNodes,
  });
  return (
    <div>
      <div className="mx-10 my-3">
        <TabList className="my-3">
          <TabButton>
            <Link to="/">Lives</Link>
          </TabButton>
          <TabButton>
            <Link to="/channels">Channels</Link>
          </TabButton>
          <TabButton active>Nodes</TabButton>
        </TabList>
      </div>
      <div className="mx-10 my-3">{nodes && <NodeTable data={nodes} />}</div>
    </div>
  );
}
