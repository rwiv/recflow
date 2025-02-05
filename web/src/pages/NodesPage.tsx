import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { TabButton, TabList } from '@/components/common/layout/Tab.tsx';
import { NodeTable } from '@/components/node/NodeTable.tsx';
import { NODES_QUERY_KEY } from '@/common/consts.ts';
import { NodeRecord } from '@/client/node.types.ts';
import { fetchNodes } from '@/client/node.client.ts';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { toQueryString } from '@/common/channel.page.ts';

export function NodesPage() {
  const { data: nodes } = useQuery<NodeRecord[]>({
    queryKey: [NODES_QUERY_KEY],
    queryFn: fetchNodes,
  });
  const { pageState } = useChannelPageStore();

  return (
    <div>
      <div className="mx-10 my-3">
        <TabList className="my-3">
          <TabButton>
            <Link to="/">Lives</Link>
          </TabButton>
          <TabButton>
            {pageState && <Link to={`/channels?${toQueryString(pageState)}`}>Channels</Link>}
          </TabButton>
          <TabButton active>Nodes</TabButton>
        </TabList>
      </div>
      <div className="mx-10 my-3">{nodes && <NodeTable data={nodes} />}</div>
    </div>
  );
}
