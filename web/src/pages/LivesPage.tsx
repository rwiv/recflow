import { LiveTable } from '@/components/live/LiveTable.tsx';
import { LiveDto } from '@/client/live.types.ts';
import { fetchAllLives } from '@/client/live.client.ts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { TabButton, TabList } from '@/components/common/layout/Tab.tsx';
import { LIVES_QUERY_KEY } from '@/common/constants.ts';
import { useChannelPageStore } from '@/hooks/channel/useChannelPageStore.ts';
import { useEffect, useState } from 'react';
import { ChannelPageState } from '@/hooks/channel/ChannelPageState.ts';
import { fetchChannels } from '@/client/channel.client.ts';

export function LivesPage() {
  const queryClient = useQueryClient();
  const { data: lives } = useQuery<LiveDto[]>({
    queryKey: [LIVES_QUERY_KEY],
    queryFn: fetchAllLives,
  });
  const { pageState, setPageState } = useChannelPageStore();
  const [withDisabled, setWithDisabled] = useState(false);
  const [targetLives, setTargetLives] = useState<LiveDto[]>([]);

  useEffect(() => {
    if (!lives) return;
    if (withDisabled) {
      setTargetLives(lives.filter((live) => !live.isDisabled));
    } else {
      setTargetLives(lives);
    }
  }, [lives, withDisabled]);

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
          <TabButton>
            <Link to="/criteria">Criteria</Link>
          </TabButton>
        </TabList>
      </div>
      <div className="mx-10 my-3">
        {targetLives && (
          <LiveTable lives={targetLives} withDisabled={withDisabled} setWithDisabled={setWithDisabled} />
        )}
      </div>
    </div>
  );
}
