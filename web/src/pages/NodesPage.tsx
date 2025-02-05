import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { TabButton, TabList } from '@/components/common/layout/Tab.tsx';
import { NodeTable } from '@/components/node/NodeTable.tsx';
import { CHANNELS_QUERY_KEY, NODES_QUERY_KEY } from '@/common/consts.ts';
import { NodeRecord } from '@/client/node.types.ts';
import { fetchNodes } from '@/client/node.client.ts';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { useEffect } from 'react';
import { defaultPageState } from '@/common/channel.page.ts';
import { fetchChannels } from '@/client/channel.client.ts';

export function NodesPage() {
  const queryClient = useQueryClient();
  const { data: nodes } = useQuery<NodeRecord[]>({
    queryKey: [NODES_QUERY_KEY],
    queryFn: fetchNodes,
  });
  const { pageState, setPageState } = useChannelPageStore();

  useEffect(() => {
    setPageState(defaultPageState());
  }, []);

  useEffect(() => {
    if (pageState) {
      queryClient.prefetchQuery({
        queryKey: [CHANNELS_QUERY_KEY, pageState.curPageNum],
        queryFn: () => fetchChannels(pageState),
      });
    }
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
