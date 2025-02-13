import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { TabButton, TabList } from '@/components/common/layout/Tab.tsx';
import { CHZZK_CRITERIA_QUERY_KEY, SOOP_CRITERIA_QUERY_KEY } from '@/common/constants.ts';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { ChannelPageState } from '@/hooks/ChannelPageState.ts';
import { fetchChannels } from '@/client/channel.client.ts';
import { fetchChzzkCriteria, fetchSoopCriteria } from '@/client/criterion.client.ts';
import { ChzzkCriterionDto, SoopCriterionDto } from '@/client/criterion.schema.ts';
import { ChzzkCriterionTable } from '@/components/criterion/ChzzkCriterionTable.tsx';

export function CriterionPage() {
  const queryClient = useQueryClient();
  const { data: chzzkCriteria } = useQuery<ChzzkCriterionDto[]>({
    queryKey: [CHZZK_CRITERIA_QUERY_KEY],
    queryFn: fetchChzzkCriteria,
  });
  const { data: soopCriteria } = useQuery<SoopCriterionDto[]>({
    queryKey: [SOOP_CRITERIA_QUERY_KEY],
    queryFn: fetchSoopCriteria,
  });
  const { pageState, setPageState } = useChannelPageStore();
  console.log(chzzkCriteria);
  console.log(soopCriteria);

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
          <TabButton>
            <Link to="/nodes">Nodes</Link>
          </TabButton>
          <TabButton active>Criteria</TabButton>
        </TabList>
      </div>
      <div className="mx-10 my-3">{chzzkCriteria && <ChzzkCriterionTable data={chzzkCriteria} />}</div>
    </div>
  );
}
