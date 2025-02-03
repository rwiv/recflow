import { LiveTable } from '@/components/live/LiveTable.tsx';
import { LiveRecord } from '@/client/types.ts';
import { fetchLives } from '@/client/client.ts';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { TabButton, TabList } from '@/components/common/ui/Tab.tsx';

export function IndexPage() {
  const { data: lives } = useQuery<LiveRecord[]>({
    queryKey: ['lives'],
    queryFn: fetchLives,
  });
  return (
    <div>
      <div className="mx-10 my-3">
        <TabList className="my-3">
          <TabButton active>Lives</TabButton>
          <TabButton>
            <Link to="/channels">Channels</Link>
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
