import { LiveTable } from '@/components/live/LiveTable.tsx';
import { LiveRecord } from '@/client/live.types.ts';
import { fetchLives } from '@/client/live.client.ts';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { TabButton, TabList } from '@/components/common/layout/Tab.tsx';
import { LIVES_QUERY_KEY } from '@/common/consts.ts';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { toQueryString } from '@/common/channel.page.ts';

export function LivesPage() {
  const { data: lives } = useQuery<LiveRecord[]>({
    queryKey: [LIVES_QUERY_KEY],
    queryFn: fetchLives,
  });
  const { pageState } = useChannelPageStore();

  return (
    <div>
      <div className="mx-10 my-3">
        <TabList className="my-3">
          <TabButton active>Lives</TabButton>
          <TabButton>
            {pageState && <Link to={`/channels?${toQueryString(pageState)}`}>Channels</Link>}
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
