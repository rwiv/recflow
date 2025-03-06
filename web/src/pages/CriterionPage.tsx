import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { TabButton, TabList } from '@/components/common/layout/Tab.tsx';
import { CHZZK_CRITERIA_QUERY_KEY, SOOP_CRITERIA_QUERY_KEY } from '@/common/constants.ts';
import { useChannelPageStore } from '@/hooks/channel/useChannelPageStore.ts';
import { ChannelPageState } from '@/hooks/channel/ChannelPageState.ts';
import { fetchChannels } from '@/client/channel/channel.client.ts';
import { fetchChzzkCriteria, fetchSoopCriteria } from '@/client/criterion/criterion.client.ts';
import { ChzzkCriterionDto, SoopCriterionDto } from '@/client/criterion/criterion.schema.ts';
import { ChzzkCriterionTable } from '@/components/criterion/ChzzkCriterionTable.tsx';
import { SoopCriterionTable } from '@/components/criterion/SoopCriterionTable.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';

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
      <div className="mx-10 my-3">
        <Tabs defaultValue="chzzk">
          <TabsList>
            <TabsTrigger value="chzzk">Chzzk</TabsTrigger>
            <TabsTrigger value="soop">Soop</TabsTrigger>
          </TabsList>
          <div className="my-5">
            <TabsContent value="chzzk">
              {chzzkCriteria && <ChzzkCriterionTable data={chzzkCriteria} />}
            </TabsContent>
            <TabsContent value="soop">
              {soopCriteria && <SoopCriterionTable data={soopCriteria} />}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
