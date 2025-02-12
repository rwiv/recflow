import { LiveTable } from '@/components/live/LiveTable.tsx';
import { LiveDto } from '@/client/live.types.ts';
import { fetchLives } from '@/client/live.client.ts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { TabButton, TabList } from '@/components/common/layout/Tab.tsx';
import { LIVES_QUERY_KEY } from '@/common/constants.ts';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { useEffect } from 'react';
import { ChannelPageState } from '@/hooks/ChannelPageState.ts';
import { fetchChannels } from '@/client/channel.client.ts';

export function LivesPage() {
  const queryClient = useQueryClient();
  const { data: lives } = useQuery<LiveDto[]>({
    queryKey: [LIVES_QUERY_KEY],
    queryFn: fetchLives,
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
          <TabButton active>Lives</TabButton>
          <TabButton>
            {pageState && <Link to={`/channels?${pageState.toQueryString()}`}>Channels</Link>}
          </TabButton>
          <TabButton>
            <Link to="/nodes">Nodes</Link>
          </TabButton>
        </TabList>
      </div>
      <div className="mx-10 my-3">{lives && <LiveTable data={lives} />}</div>
    </div>
  );
}
