import { ChannelTable } from '@/components/channel/ChannelTable.tsx';
import { TabButton, TabList } from '@/components/common/layout/Tab.tsx';
import { Link, useSearchParams } from 'react-router';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { ChannelPageStateBuilder } from '@/hooks/channel.page.state.ts';
import { DEFAULT_PAGE_NUMBER } from '@/common/consts.ts';
import { useEffect } from 'react';

export function ChannelsPage() {
  const [searchParams] = useSearchParams();
  const { pageState, setPageState } = useChannelPageStore();

  useEffect(() => {
    setPageState(getPageState(searchParams));
  }, [searchParams, setPageState]);

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
      {pageState && (
        <div className="mx-10 my-3">
          <ChannelTable pageState={pageState} />
        </div>
      )}
    </div>
  );
}

function getPageState(params: URLSearchParams) {
  let page = DEFAULT_PAGE_NUMBER;
  const builder = new ChannelPageStateBuilder();
  const pageStr = params.get('p');
  if (pageStr !== null) {
    const parsed = parseInt(pageStr, 10);
    if (!isNaN(parsed)) {
      page = parsed;
    }
  }
  builder.setCurPageNum(page);
  builder.setSorted(params.get('st'));
  builder.setPriority(params.get('pri'));
  builder.setTagName(params.get('tn'));
  return builder.build();
}
