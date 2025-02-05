import { LiveTable } from '@/components/live/LiveTable.tsx';
import { LiveRecord } from '@/client/live.types.ts';
import { fetchLives } from '@/client/live.client.ts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { TabButton, TabList } from '@/components/common/layout/Tab.tsx';
import { CHANNELS_QUERY_KEY, LIVES_QUERY_KEY } from '@/common/consts.ts';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { useEffect } from 'react';
import { defaultPageState } from '@/common/channel.page.ts';
import { fetchChannels } from '@/client/channel.client.ts';

export function LivesPage() {
  const queryClient = useQueryClient();
  const { data: lives } = useQuery<LiveRecord[]>({
    queryKey: [LIVES_QUERY_KEY],
    queryFn: fetchLives,
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
