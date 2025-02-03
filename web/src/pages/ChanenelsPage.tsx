import { ChannelTable } from '@/components/table/channel/ChannelTable.tsx';
import { TabButton, TabList } from '@/components/common/Tab.tsx';
import { Link, useSearchParams } from 'react-router';

export function ChannelsPage() {
  const [searchParams] = useSearchParams();

  const page = convertToNumber(searchParams.get('p'), 1);

  return (
    <div>
      <div className="mx-10 my-3">
        <TabList className="my-3">
          <TabButton>
            <Link to="/">Lives</Link>
          </TabButton>
          <TabButton active>Channels</TabButton>
          <TabButton>
            <Link to="/nodes">Nodes</Link>
          </TabButton>
        </TabList>
      </div>
      <div className="mx-10 my-3">
        <ChannelTable page={page} size={3} />
      </div>
    </div>
  );
}

function convertToNumber(value: string | null, defaultValue: number): number {
  if (value === null) {
    return defaultValue;
  }
  const number = parseInt(value, 10);
  if (isNaN(number)) {
    return defaultValue;
  }
  return number;
}
