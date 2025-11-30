import { useEffect } from 'react';
import { useSearchParams } from 'react-router';

import { ChannelPageStateBuilder } from '@/entities/channel/channel/model/ChannelPageStateBuilder.ts';
import { useChannelPageStore } from '@/entities/channel/channel/model/useChannelPageStore.ts';
import { platformNameEnum } from '@/entities/platform/model/platform.schema.ts';

import { PageHeaderTab } from '@/widgets/header/ui/PageHeaderTab.tsx';

import { DEFAULT_CHANNEL_PAGE_NUMBER } from '@/pages/channel/channel/config/constants.ts';
import { ChannelTable } from '@/pages/channel/channel/ui/table/table/ChannelTable.tsx';

export function ChannelPage() {
  const [searchParams] = useSearchParams();
  const { pageState, setPageState } = useChannelPageStore();

  useEffect(() => {
    setPageState(getPageState(searchParams));
  }, [searchParams, setPageState]);

  return (
    <div>
      {pageState && <PageHeaderTab channel channelUrl={`/channels?${pageState.toQueryString()}`} />}
      {pageState && (
        <div className="mx-10 my-3">
          <ChannelTable pageState={pageState} />
        </div>
      )}
    </div>
  );
}

function getPageState(params: URLSearchParams) {
  let page = DEFAULT_CHANNEL_PAGE_NUMBER;
  const builder = new ChannelPageStateBuilder();
  const pageStr = params.get('p');
  if (pageStr !== null) {
    const parsed = parseInt(pageStr, 10);
    if (!isNaN(parsed)) {
      page = parsed;
    }
  }
  const platformNameRaw = params.get('pf');
  const platformName = platformNameRaw ? platformNameEnum.parse(platformNameRaw) : null;

  builder.setCurPageNum(page);
  builder.setSorted(params.get('st'));
  builder.setGrade(params.get('gr'));
  builder.setPlatform(platformName);
  builder.setIncludeTags(params.get('it')?.split(',') ?? []);
  builder.setExcludeTags(params.get('et')?.split(',') ?? []);
  builder.setSourceId(params.get('uid'));
  builder.setUsername(params.get('uname'));
  return builder.build();
}
