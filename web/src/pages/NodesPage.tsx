import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { TabButton, TabList } from '@/components/common/layout/Tab.tsx';
import { NodeTable } from '@/components/node/NodeTable.tsx';
import { NODES_QUERY_KEY } from '@/common/constants.ts';
import { NodeDto } from '@/client/node.schema.ts';
import { fetchNodes } from '@/client/node.client.ts';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { ChannelPageState } from '@/hooks/ChannelPageState.ts';
import { fetchChannels } from '@/client/channel.client.ts';

export function NodesPage() {
  const queryClient = useQueryClient();
  const { data: nodes } = useQuery<NodeDto[]>({
    queryKey: [NODES_QUERY_KEY],
    queryFn: fetchNodes,
  });
  const { pageState, setPageState } = useChannelPageStore();

  useEffect(() => {
    setPageState(ChannelPageState.default());
  }, []);

  useEffect(() => {
    if (!pageState) return;
    queryClient.prefetchQuery({
      queryKey: pageState.queryKeys(),
      queryFn: () => fetchChannels(pageState),
    });
  }, [pageState, queryClient]);

  return (
    <div>
      <div className="mx-10 my-3">
        <TabList className="my-3">
          <TabButton>
            <Link to="/">Lives</Link>
          </TabButton>
          <TabButton>
            {pageState && <Link to={`/channels?${pageState.toQueryString()}`}>Channels</Link>}
          </TabButton>
          <TabButton active>Nodes</TabButton>
        </TabList>
      </div>
      <div className="mx-10 my-3">{nodes && <NodeTable data={nodes} />}</div>
    </div>
  );
}
