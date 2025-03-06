import { useQuery } from '@tanstack/react-query';
import { CHZZK_CRITERIA_QUERY_KEY, SOOP_CRITERIA_QUERY_KEY } from '@/common/constants.ts';
import { fetchChzzkCriteria, fetchSoopCriteria } from '@/client/criterion/criterion.client.ts';
import { ChzzkCriterionDto, SoopCriterionDto } from '@/client/criterion/criterion.schema.ts';
import { ChzzkCriterionTable } from '@/components/criterion/ChzzkCriterionTable.tsx';
import { SoopCriterionTable } from '@/components/criterion/SoopCriterionTable.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { PageHeaderTab } from '@/components/common/layout/PageHeaderTab.tsx';

export function CriterionPage() {
  const { data: chzzkCriteria } = useQuery<ChzzkCriterionDto[]>({
    queryKey: [CHZZK_CRITERIA_QUERY_KEY],
    queryFn: fetchChzzkCriteria,
  });
  const { data: soopCriteria } = useQuery<SoopCriterionDto[]>({
    queryKey: [SOOP_CRITERIA_QUERY_KEY],
    queryFn: fetchSoopCriteria,
  });

  return (
    <div>
      <PageHeaderTab criterion />
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
